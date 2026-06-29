import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import {
  DetailsCardComponent,
  DetailsCardHeaderComponent,
  DetailsInfoFieldComponent,
  DetailsInfoGridComponent,
  DetailsSectionCardComponent,
} from '@shared/components/details';
import {
  EmptyStateComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
  TextBadgeComponent,
} from '@shared/components/ui';
import { PurchaseApplicationService } from '@features/purchases/services/application/purchase-application.service';
import { CancelPurchaseDialogComponent } from '@features/purchases/components/cancel-purchase-dialog/cancel-purchase-dialog.component';
import { PurchaseStatus, getPurchaseStatusLabel } from '@features/purchases/models/enums/purchase-status.enum';
import { PURCHASE_SUCCESS_MESSAGES } from '@features/purchases/messages';

@Component({
  selector: 'app-purchase-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    DecimalPipe,
    MainLayoutComponent,
    ButtonModule,
    TableModule,
    DetailsCardComponent,
    DetailsCardHeaderComponent,
    DetailsInfoFieldComponent,
    DetailsInfoGridComponent,
    DetailsSectionCardComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    TextBadgeComponent,
    CancelPurchaseDialogComponent,
  ],
  templateUrl: './purchase-detail-page.component.html',
})
export class PurchaseDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly purchaseService = inject(PurchaseApplicationService);
  private readonly messageService = inject(MessageService);

  readonly purchase = this.purchaseService.currentPurchase;
  readonly loading = this.purchaseService.loading;

  readonly PurchaseStatus = PurchaseStatus;
  readonly cancelDialogVisible = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.purchaseService.loadById(id).subscribe({
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar la compra. Es posible que no exista.',
            life: 5000,
          });
          this.router.navigate(['/purchases']);
        },
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/purchases']);
  }

  onEdit(): void {
    const id = this.purchase()?.id;
    if (id) this.router.navigate(['/purchases', id, 'edit']);
  }

  openCancelDialog(): void {
    this.cancelDialogVisible.set(true);
  }

  onCancelDialogConfirmed(request: { reason: string; notes: string }): void {
    const purchase = this.purchase();
    if (!purchase) return;
    this.cancelDialogVisible.set(false);
    this.purchaseService.cancel(purchase.id, request).subscribe({
      next: () => {
        this.messageService.add(PURCHASE_SUCCESS_MESSAGES.cancelled);
        this.purchaseService.loadById(purchase.id).subscribe();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cancelar la compra. Por favor, intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  onCancelDialogDismissed(): void {
    this.cancelDialogVisible.set(false);
  }

  getStatusLabel(status: PurchaseStatus): string {
    return getPurchaseStatusLabel(status);
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
