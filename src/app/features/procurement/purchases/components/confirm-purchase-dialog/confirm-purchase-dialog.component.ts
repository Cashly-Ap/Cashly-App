import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { PurchaseApiService } from '@features/procurement/purchases/services/api/purchase-api.service';
import { PurchaseDetails } from '@features/procurement/purchases/models/interfaces/purchase-details.interface';
import { PurchaseStatus } from '@features/procurement/purchases/models/enums/purchase-status.enum';
@Component({
  selector: 'app-confirm-purchase-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogModule, ButtonModule, TableModule, DatePipe, DecimalPipe],
  templateUrl: './confirm-purchase-dialog.component.html',
})
export class ConfirmPurchaseDialogComponent {
  private readonly api = inject(PurchaseApiService);

  readonly purchaseId = input<string | null>(null);
  readonly visible = input<boolean>(false);
  readonly confirmed = output<string>();
  readonly cancelled = output<void>();

  readonly details = signal<PurchaseDetails | null>(null);
  readonly loading = signal(false);
  readonly confirming = signal(false);
  readonly error = signal<string | null>(null);

  readonly purchase = computed(() => this.details());

  onDialogShow(): void {
    const id = this.purchaseId();
    if (!id || this.details()?.id === id) return;

    this.loading.set(true);
    this.error.set(null);
    this.api.getById(id).subscribe({
      next: (result) => {
        this.details.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Error al cargar los detalles de la compra.');
      },
    });
  }

  onConfirm(): void {
    const id = this.purchaseId();
    if (!id) return;

    this.confirming.set(true);
    this.confirmed.emit(id);
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onHide(): void {
    this.reset();
  }

  reset(): void {
    this.details.set(null);
    this.loading.set(false);
    this.confirming.set(false);
    this.error.set(null);
  }

  getStatusLabel(status: PurchaseStatus): string {
    const labels: Record<PurchaseStatus, string> = {
      [PurchaseStatus.DRAFT]: 'Borrador',
      [PurchaseStatus.CONFIRMED]: 'Confirmada',
      [PurchaseStatus.CANCELLED]: 'Cancelada',
    };
    return labels[status] ?? status;
  }

  getStatusVariant(status: PurchaseStatus): 'success' | 'danger' | 'label' {
    const variants: Record<PurchaseStatus, 'success' | 'danger' | 'label'> = {
      [PurchaseStatus.DRAFT]: 'label',
      [PurchaseStatus.CONFIRMED]: 'success',
      [PurchaseStatus.CANCELLED]: 'danger',
    };
    return variants[status] ?? 'label';
  }
}
