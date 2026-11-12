import { TranslatePipe } from '@core/i18n/translate.pipe';
import { LocalizedCurrencyPipe, LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { PasswordModule } from 'primeng/password';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { LanguageService } from '@core/i18n/language.service';
import { CustomerBalanceApiService } from '@features/partners/customers/services/api/customer-balance-api.service';
import { ReceivablesApiService } from '@features/finance/treasury/receivables/services/api/receivables-api.service';
import { CreditStatusResponse } from '@features/finance/treasury/receivables/models/interfaces/credit-status.interface';
import { PaymentMethodApiService } from '@features/finance/treasury/payment-methods/services/api/payment-method-api.service';
import { PaymentMethodList } from '@features/finance/treasury/payment-methods/models/interfaces/payment-method.interface';
import { InvoiceList } from '@features/finance/billing/invoices/models/interfaces/invoice-list.interface';
import { PaymentType } from '@features/finance/billing/invoices/models/enums/payment-type.enum';

export interface ConfirmInvoiceSubmit {
  useBalance: boolean;
  balanceAmount: number;
  paymentMethodId?: string;
  confirmationPassword?: string;
}

interface PaymentLine {
  methodId: string;
  amount: number;
}

import { CancelButtonComponent } from '@shared/components/ui/cancel-button/cancel-button.component';
@Component({
  selector: 'app-confirm-invoice-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    CancelButtonComponent,
    TranslatePipe,
    LocalizedCurrencyPipe,
    LocalizedNumberPipe,
    PermissionDirective,
    FormsModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    InputNumberModule,
    PasswordModule,
    RadioButtonModule,
  ],
  templateUrl: './confirm-invoice-dialog.component.html',
})
export class ConfirmInvoiceDialogComponent {
  readonly locale = inject(LanguageService).locale;

  private readonly balanceApi = inject(CustomerBalanceApiService);
  private readonly receivablesApi = inject(ReceivablesApiService);
  private readonly paymentMethodApi = inject(PaymentMethodApiService);
  private readonly messages = inject(MessageService);

  readonly visible = input.required<boolean>();
  readonly invoice = input.required<InvoiceList | null>();
  readonly submitting = input(false);

  readonly confirmed = output<ConfirmInvoiceSubmit>();
  readonly cancelled = output<void>();

  readonly customerBalanceConfirm = signal(0);
  readonly useBalanceConfirm = signal(false);
  readonly confirmationPassword = signal('');
  readonly paymentMethods = signal<PaymentMethodList[]>([]);
  readonly paymentLines = signal<PaymentLine[]>([]);
  readonly creditStatus = signal<CreditStatusResponse | null>(null);

  readonly totalPayments = computed(() => {
    const balance = this.useBalanceConfirm()
      ? Math.min(this.customerBalanceConfirm(), this.invoice()?.total ?? 0)
      : 0;
    const methods = this.paymentLines().reduce((sum, line) => sum + (line.amount || 0), 0);
    return balance + methods;
  });

  readonly remainingToPay = computed(() =>
    Math.max(0, (this.invoice()?.total ?? 0) - this.totalPayments()),
  );

  readonly maxPaymentPerLine = computed(() => {
    const total = this.invoice()?.total ?? 0;
    const balanceUsed = this.useBalanceConfirm()
      ? Math.min(this.customerBalanceConfirm(), total)
      : 0;
    const alreadyAssigned = this.paymentLines().reduce((sum, line) => sum + (line.amount || 0), 0);
    return Math.max(0, total - balanceUsed - alreadyAssigned);
  });

  readonly allPaymentsValid = computed(() => {
    const lines = this.paymentLines();
    const total = this.invoice()?.total ?? 0;
    if (lines.length === 0 && !this.useBalanceConfirm()) return false;
    return (
      lines.every((line) => line.methodId && line.amount > 0) && this.totalPayments() === total
    );
  });

  constructor() {
    effect(() => {
      const invoice = this.invoice();
      if (!this.visible() || !invoice) return;
      this.reset();
      if (invoice.paymentType === PaymentType.CASH) this.loadPaymentOptions(invoice.customerId);
      else this.loadCreditStatus(invoice.customerId);
    });
  }

  addPaymentLine(): void {
    this.paymentLines.update((lines) => [...lines, { methodId: '', amount: 0 }]);
  }

  removePaymentLine(index: number): void {
    this.paymentLines.update((lines) => lines.filter((_, position) => position !== index));
  }

  updatePaymentLine(index: number, field: keyof PaymentLine, value: string | number | null): void {
    this.paymentLines.update((lines) => {
      const updated = [...lines];
      const line = updated[index];
      if (!line) return lines;
      if (field === 'amount') {
        const amount = Number(value) || 0;
        const max = this.maxForLine(index);
        updated[index] = { ...line, amount: amount > max ? max : amount };
        return updated;
      }
      updated[index] = { ...line, methodId: String(value ?? '') };
      return updated;
    });
  }

  maxForLine(index: number): number {
    const total = this.invoice()?.total ?? 0;
    const balanceUsed = this.useBalanceConfirm()
      ? Math.min(this.customerBalanceConfirm(), total)
      : 0;
    const otherLines = this.paymentLines()
      .filter((_, position) => position !== index)
      .reduce((sum, line) => sum + (line.amount || 0), 0);
    return Math.max(0, total - balanceUsed - otherLines);
  }

  trackByIndex(index: number): number {
    return index;
  }

  submitConfirm(): void {
    const invoice = this.invoice();
    if (!invoice) return;

    if (invoice.paymentType === PaymentType.CASH) {
      const useBalance = this.useBalanceConfirm();
      const line = this.paymentLines()[0];
      this.confirmed.emit({
        useBalance,
        balanceAmount: useBalance ? Math.min(this.customerBalanceConfirm(), invoice.total) : 0,
        ...(line ? { paymentMethodId: line.methodId } : {}),
      });
      return;
    }

    const password = this.confirmationPassword();
    if (!password) {
      this.messages.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe ingresar su contraseña.',
        life: 4000,
      });
      return;
    }

    this.confirmed.emit({ useBalance: false, balanceAmount: 0, confirmationPassword: password });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  private reset(): void {
    this.customerBalanceConfirm.set(0);
    this.useBalanceConfirm.set(false);
    this.confirmationPassword.set('');
    this.paymentMethods.set([]);
    this.paymentLines.set([]);
    this.creditStatus.set(null);
  }

  private loadPaymentOptions(customerId: string): void {
    this.balanceApi.getBalance(customerId).subscribe({
      next: (balance) => this.customerBalanceConfirm.set(balance.totalBalance),
      error: () => this.customerBalanceConfirm.set(0),
    });
    this.paymentMethodApi.getAll({ active: true }).subscribe({
      next: (methods) => this.paymentMethods.set(methods.content),
      error: () => this.paymentMethods.set([]),
    });
  }

  private loadCreditStatus(customerId: string): void {
    this.receivablesApi.getCreditStatus(customerId).subscribe({
      next: (status) => this.creditStatus.set(status),
      error: () => this.creditStatus.set(null),
    });
  }
}
