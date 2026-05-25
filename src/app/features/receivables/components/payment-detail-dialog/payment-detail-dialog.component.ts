import { Component, input, output, inject, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { environment } from '@env/environment';
import { PendingPayment } from '../../models/interfaces';
import { ReceivablesApplicationService } from '../../services/application/receivables-application.service';

function getPaymentStatusLabel(status: string): string {
  switch (status) {
    case 'PENDING_APPROVAL':
      return 'Pendiente de Aprobación';
    case 'APPROVED':
      return 'Aprobado';
    case 'REJECTED':
      return 'Rechazado';
    case 'PENDING':
      return 'Pendiente';
    default:
      return status;
  }
}

function getPaymentStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'contrast' {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'PENDING_APPROVAL':
      return 'warn';
    case 'REJECTED':
      return 'danger';
    case 'PENDING':
      return 'info';
    default:
      return 'info';
  }
}

@Component({
  selector: 'app-payment-detail-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule, TagModule, CurrencyPipe, DatePipe],
  templateUrl: './payment-detail-dialog.component.html',
})
export class PaymentDetailDialogComponent {
  private service = inject(ReceivablesApplicationService);

  readonly visible = input.required<boolean>();
  readonly payment = input.required<PendingPayment | null>();

  readonly close = output<void>();

  protected readonly getPaymentStatusLabel = getPaymentStatusLabel;
  protected readonly getPaymentStatusSeverity = getPaymentStatusSeverity;

  protected onClose(): void {
    this.close.emit();
  }

  protected onVisibleChange(isVisible: boolean): void {
    if (!isVisible) {
      this.onClose();
    }
  }

  protected onViewProof(): void {
    const payment = this.payment();
    if (!payment?.voucherPath) return;

    window.open(payment.voucherPath, '_blank');
  }
}
