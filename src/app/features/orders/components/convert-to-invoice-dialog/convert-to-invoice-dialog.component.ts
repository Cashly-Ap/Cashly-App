import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { PaymentType, PAYMENT_TYPE_LABELS } from '@features/invoices/models/enums/payment-type.enum';
import { ReceivablesApiService } from '@features/receivables/services/api/receivables-api.service';
import { CreditStatusResponse } from '@features/receivables/models/interfaces';

@Component({
  selector: 'app-convert-to-invoice-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule, SelectModule, FormsModule, DecimalPipe],
  templateUrl: './convert-to-invoice-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConvertToInvoiceDialogComponent {
  private readonly receivablesApi = inject(ReceivablesApiService);

  readonly visible = input<boolean>(false);
  readonly orderNumber = input<string>('');
  readonly customerName = input<string>('');
  readonly totalAmount = input<number>(0);
  readonly customerId = input<string>('');

  readonly paymentType = signal<PaymentType>(PaymentType.CASH);
  readonly paymentTypeOptions = Object.values(PaymentType).map((pt) => ({
    label: PAYMENT_TYPE_LABELS[pt],
    value: pt,
  }));

  readonly creditStatus = signal<CreditStatusResponse | null>(null);
  readonly creditLoading = signal(false);

  readonly creditWarningMessage = computed(() => {
    if (this.creditLoading()) return undefined; 
    const status = this.creditStatus();
    if (!status || this.paymentType() !== PaymentType.CREDIT) return null;

    const total = this.totalAmount();
    if (status.availableCredit >= total && !status.hasOverdue && status.canCreateCreditInvoice) return null;

    const parts: string[] = [];
    if (status.hasOverdue) parts.push('El cliente tiene facturas vencidas.');
    if (total > status.availableCredit) {
      const deficit = total - status.availableCredit;
      parts.push(`El total de la factura (${total.toLocaleString()}) excede el crédito disponible (${status.availableCredit.toLocaleString()}) por ${deficit.toLocaleString()}.`);
    }
    if (!status.canCreateCreditInvoice) parts.push('El cliente no puede crear facturas a crédito.');

    return {
      message: parts.join(' '),
      creditLimit: status.creditLimit,
      availableCredit: status.availableCredit,
      invoiceTotal: total,
    };
  });

  readonly creditBlocked = computed(
    () => this.paymentType() === PaymentType.CREDIT && (this.creditLoading() || !!this.creditWarningMessage()),
  );

  readonly confirmed = output<string>();
  readonly cancelled = output<void>();

  private loadCreditStatus(customerId: string): void {
    this.creditLoading.set(true);
    this.creditStatus.set(null);
    this.receivablesApi.getCreditStatus(customerId).subscribe({
      next: (status) => {
        this.creditStatus.set(status);
        this.creditLoading.set(false);
      },
      error: () => {
        this.creditStatus.set(null);
        this.creditLoading.set(false);
      },
    });
  }

  onPaymentTypeChange(paymentType: PaymentType): void {
    this.paymentType.set(paymentType);
    const cid = this.customerId();
    if (cid && paymentType === PaymentType.CREDIT) {
      this.loadCreditStatus(cid);
    } else {
      this.creditStatus.set(null);
    }
  }

  onConfirm(): void {
    this.confirmed.emit(this.paymentType());
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
