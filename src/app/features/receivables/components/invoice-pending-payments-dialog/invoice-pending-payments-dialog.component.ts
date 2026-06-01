import { Component, input, output, inject, signal, effect, computed } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ReceivablesApiService } from '../../services/api/receivables-api.service';
import { ReceivablesApplicationService } from '../../services/application/receivables-application.service';
import { PendingPayment } from '../../models/interfaces';

@Component({
  selector: 'app-invoice-pending-payments-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule, TableModule, TooltipModule, CurrencyPipe, DatePipe],
  templateUrl: './invoice-pending-payments-dialog.component.html',
})
export class InvoicePendingPaymentsDialogComponent {
  private apiService = inject(ReceivablesApiService);
  private service = inject(ReceivablesApplicationService);

  readonly visible = input.required<boolean>();
  readonly invoiceId = input.required<string>();
  readonly invoiceNumber = input<string>('');

  readonly close = output<void>();

  protected payments = signal<PendingPayment[]>([]);
  protected loading = signal(false);

  protected dialogTitle = computed(() => {
    const num = this.invoiceNumber();
    return num ? `Historial de Pagos - Factura ${num}` : 'Historial de Pagos';
  });

  protected readonly isMerchant = computed(() => this.service.isMerchant());

  constructor() {
    effect(() => {
      const invoiceId = this.invoiceId();
      const isVisible = this.visible();
      if (isVisible && invoiceId) {
        this.loadPendingPayments(invoiceId);
      } else if (!isVisible) {
        this.payments.set([]);
      }
    });
  }

  protected onClose(): void {
    this.close.emit();
  }

  protected onVisibleChange(isVisible: boolean): void {
    if (!isVisible) {
      this.onClose();
    }
  }

  private loadPendingPayments(invoiceId: string): void {
    this.loading.set(true);
    const params = { invoiceId, page: 0, size: 100 };

    this.apiService.getPendingPayments(params).subscribe({
      next: (response) => {
        this.payments.set(response.content ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.payments.set([]);
        this.loading.set(false);
      },
    });
  }
}
