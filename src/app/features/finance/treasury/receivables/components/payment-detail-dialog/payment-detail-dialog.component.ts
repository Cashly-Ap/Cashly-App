import { paymentStatusSeverity } from '@features/finance/treasury/receivables/models/payment-status.presentation';
import { LocalizedDatePipe, LocalizedCurrencyPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Component, input, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

import { PendingPayment } from '@features/finance/treasury/receivables/models/interfaces/pending-payment.interface';

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

import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
@Component({
  selector: 'app-payment-detail-dialog',
  standalone: true,
  imports: [
    TextBadgeComponent,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedCurrencyPipe,
    DialogModule,
    ButtonModule,
  ],
  templateUrl: './payment-detail-dialog.component.html',
})
export class PaymentDetailDialogComponent {
  readonly visible = input.required<boolean>();
  readonly payment = input.required<PendingPayment | null>();

  readonly close = output<void>();

  protected readonly getPaymentStatusLabel = getPaymentStatusLabel;
  protected readonly getPaymentStatusSeverity = paymentStatusSeverity;

  protected onClose(): void {
    this.close.emit();
  }

  protected onVisibleChange(isVisible: boolean): void {
    if (!isVisible) {
      this.onClose();
    }
  }
}
