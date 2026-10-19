import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { PasswordModule } from 'primeng/password';
import { RadioButtonModule } from 'primeng/radiobutton';
import {
  PaymentType,
  PAYMENT_TYPE_LABELS,
} from '@features/finance/billing/invoices/models/enums/payment-type.enum';
import { ReceivablesApiService } from '@features/finance/treasury/receivables/services/api/receivables-api.service';
import { CreditStatusResponse } from '@features/finance/treasury/receivables/models/interfaces/credit-status.interface';
import { PaymentMethodApiService } from '@features/finance/treasury/payment-methods/services/api/payment-method-api.service';
import { PaymentMethodList } from '@features/finance/treasury/payment-methods/models/interfaces/payment-method.interface';
import { CustomerBalanceApiService } from '@features/partners/customers/services/api/customer-balance-api.service';
import { ConvertToInvoiceRequest } from '@features/sales/orders/services/api/order-api.service';

@Component({
  selector: 'app-convert-to-invoice-dialog',
  standalone: true,
  styles: [
    `
      ::ng-deep .confirm-invoice-dialog .p-select,
      ::ng-deep .confirm-invoice-dialog .p-inputnumber {
        width: 100% !important;
      }
      ::ng-deep .confirm-invoice-dialog .p-select .p-select-label,
      ::ng-deep .confirm-invoice-dialog .p-inputnumber .p-inputnumber-input {
        width: 100% !important;
      }
    `,
  ],
  imports: [
    PermissionDirective,
    DialogModule,
    ButtonModule,
    SelectModule,
    FormsModule,
    DecimalPipe,
    InputNumberModule,
    PasswordModule,
    RadioButtonModule,
  ],
  templateUrl: './convert-to-invoice-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConvertToInvoiceDialogComponent implements OnChanges {
  private readonly receivablesApi = inject(ReceivablesApiService);
  private readonly balanceApi = inject(CustomerBalanceApiService);
  private readonly paymentMethodApi = inject(PaymentMethodApiService);

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
    const status = this.creditStatus();
    if (!status || this.paymentType() !== PaymentType.CREDIT) return null;
    const total = this.totalAmount();
    if (status.availableCredit >= total && !status.hasOverdue && status.canCreateCreditInvoice)
      return null;

    const parts: string[] = [];
    if (status.hasOverdue) parts.push('El cliente tiene facturas vencidas.');
    if (total > status.availableCredit) {
      const deficit = total - status.availableCredit;
      parts.push(
        `El total de la factura (${total.toLocaleString()}) excede el crédito disponible (${status.availableCredit.toLocaleString()}) por ${deficit.toLocaleString()}.`,
      );
    }
    if (!status.canCreateCreditInvoice) parts.push('El cliente no puede crear facturas a crédito.');

    return {
      message: parts.join(' '),
      creditLimit: status.creditLimit,
      availableCredit: status.availableCredit,
      invoiceTotal: total,
    };
  });

  readonly isCredit = computed(() => this.paymentType() === PaymentType.CREDIT);
  readonly isCash = computed(() => this.paymentType() === PaymentType.CASH);

  readonly confirmationPassword = signal('');
  readonly useBalance = signal(false);
  readonly customerBalance = signal(0);
  readonly paymentMethods = signal<PaymentMethodList[]>([]);
  readonly paymentLines = signal<{ methodId: string; amount: number }[]>([]);
  readonly isConfirming = signal(false);

  readonly totalPayments = computed(() => {
    const balance = this.useBalance() ? Math.min(this.customerBalance(), this.totalAmount()) : 0;
    const methods = this.paymentLines().reduce((s, l) => s + (l.amount || 0), 0);
    return balance + methods;
  });

  readonly remainingToPay = computed(() => {
    return Math.max(0, this.totalAmount() - this.totalPayments());
  });

  readonly allPaymentsValid = computed(() => {
    const lines = this.paymentLines();
    const total = this.totalAmount();
    if (lines.length === 0 && !this.useBalance()) return false;
    return lines.every((l) => l.methodId && l.amount > 0) && this.totalPayments() === total;
  });

  maxForLine(index: number): number {
    const balanceUsed = this.useBalance()
      ? Math.min(this.customerBalance(), this.totalAmount())
      : 0;
    const otherLines = this.paymentLines()
      .filter((_, i) => i !== index)
      .reduce((s, l) => s + (l.amount || 0), 0);
    return Math.max(0, this.totalAmount() - balanceUsed - otherLines);
  }

  readonly canConfirm = computed(() => {
    if (this.isCash()) return this.allPaymentsValid();
    if (this.creditLoading()) return false;
    if (this.creditWarningMessage()) return !!this.confirmationPassword();
    return true;
  });

  readonly confirmed = output<ConvertToInvoiceRequest>();
  readonly cancelled = output<void>();

  ngOnChanges(): void {
    if (this.visible() && this.customerId()) {
      const cid = this.customerId();
      if (this.paymentType() === PaymentType.CREDIT) {
        this.loadCreditStatus(cid);
      } else if (this.paymentType() === PaymentType.CASH) {
        this.loadCashData(cid);
      }
    }
    if (!this.visible()) {
      this.resetAll();
    }
  }

  addPaymentLine(): void {
    this.paymentLines.update((lines) => [...lines, { methodId: '', amount: 0 }]);
  }

  trackByIndex(index: number): number {
    return index;
  }

  removePaymentLine(index: number): void {
    this.paymentLines.update((lines) => lines.filter((_, i) => i !== index));
  }

  updatePaymentLine(index: number, field: 'methodId' | 'amount', value: any): void {
    this.paymentLines.update((lines) => {
      const updated = [...lines];
      if (field === 'amount') {
        const v = Number(value) || 0;
        const max = this.maxForLine(index);
        updated[index] = { ...updated[index], amount: v > max ? max : v };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  }

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
    this.resetPaymentData();
    const cid = this.customerId();
    if (cid) {
      if (paymentType === PaymentType.CREDIT) {
        this.loadCreditStatus(cid);
      } else {
        this.creditStatus.set(null);
      }
      if (paymentType === PaymentType.CASH) {
        this.loadCashData(cid);
      }
    }
  }

  private loadCashData(customerId: string): void {
    this.balanceApi.getBalance(customerId).subscribe({
      next: (b) => this.customerBalance.set(b.totalBalance),
      error: () => this.customerBalance.set(0),
    });
    this.paymentMethodApi.getAll({ active: true }).subscribe({
      next: (methods) => this.paymentMethods.set(methods.content),
      error: () => this.paymentMethods.set([]),
    });
  }

  private resetPaymentData(): void {
    this.confirmationPassword.set('');
    this.useBalance.set(false);
    this.customerBalance.set(0);
    this.paymentMethods.set([]);
    this.paymentLines.set([]);
  }

  private resetAll(): void {
    this.creditStatus.set(null);
    this.creditLoading.set(false);
    this.isConfirming.set(false);
    this.paymentType.set(PaymentType.CASH);
    this.resetPaymentData();
  }

  onConfirm(): void {
    if (!this.canConfirm()) return;
    const request: ConvertToInvoiceRequest = { paymentType: this.paymentType() };
    if (this.isCash()) {
      const balanceToUse = this.useBalance()
        ? Math.min(this.customerBalance(), this.totalAmount())
        : 0;
      request.useBalance = this.useBalance();
      request.balanceAmount = balanceToUse;
      const lines = this.paymentLines();
      if (lines.length > 0) {
        request.paymentMethodId = lines[0].methodId;
      }
    } else if (this.creditWarningMessage()) {
      request.confirmationPassword = this.confirmationPassword();
    }
    this.isConfirming.set(true);
    this.confirmed.emit(request);
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
