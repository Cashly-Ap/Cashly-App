import { Component, input, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { PendingPayment } from '@features/receivables/models/interfaces';

function getPaymentStatusLabel(status: string): string {
  switch (status) {
    case 'APPLIED':
      return 'Aplicado';
    case 'CANCELLED':
      return 'Cancelado';
    default:
      return status;
  }
}

function getPaymentStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'contrast' {
  switch (status) {
    case 'APPLIED':
      return 'success';
    case 'CANCELLED':
      return 'danger';
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
}
