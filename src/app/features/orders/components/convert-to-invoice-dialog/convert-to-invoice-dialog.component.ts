import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { PaymentType, PAYMENT_TYPE_LABELS } from '@features/invoices/models/enums/payment-type.enum';

@Component({
  selector: 'app-convert-to-invoice-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule, SelectModule, FormsModule, DecimalPipe],
  templateUrl: './convert-to-invoice-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConvertToInvoiceDialogComponent {
  readonly visible = input<boolean>(false);
  readonly orderNumber = input<string>('');
  readonly customerName = input<string>('');
  readonly totalAmount = input<number>(0);

  readonly paymentType = signal<PaymentType>(PaymentType.CASH);
  readonly paymentTypeOptions = Object.values(PaymentType).map((pt) => ({
    label: PAYMENT_TYPE_LABELS[pt],
    value: pt,
  }));

  readonly confirmed = output<string>();
  readonly cancelled = output<void>();

  onConfirm(): void {
    this.confirmed.emit(this.paymentType());
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
