import { reviewDocumentStock } from '@shared/utils/document-stock';
import { LanguageService } from '@core/i18n/language.service';
import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
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
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { PasswordModule } from 'primeng/password';
import { RadioButtonModule } from 'primeng/radiobutton';
import {
  PaymentType,
  PAYMENT_TYPE_LABELS,
} from '@features/finance/billing/invoices/models/enums/payment-type.enum';
import { QuoteApiService } from '@features/sales/quotes/services/api/quote-api.service';
import { QuoteDetails } from '@features/sales/quotes/models/interfaces/quote-details.interface';
import { ReceivablesApiService } from '@features/finance/treasury/receivables/services/api/receivables-api.service';
import { CreditStatusResponse } from '@features/finance/treasury/receivables/models/interfaces/credit-status.interface';
import { PaymentMethodApiService } from '@features/finance/treasury/payment-methods/services/api/payment-method-api.service';
import { PaymentMethodList } from '@features/finance/treasury/payment-methods/models/interfaces/payment-method.interface';
import { CustomerBalanceApiService } from '@features/partners/customers/services/api/customer-balance-api.service';
import { ConvertToInvoiceRequest } from '@features/sales/quotes/services/api/quote-api.service';
import { DocumentConfirmationDialogComponent } from '@shared/components/document-confirmation-dialog/document-confirmation-dialog.component';
import { DocumentConfirmationModel } from '@shared/models/document-confirmation';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

interface AllocationWithStock {
  warehouseName: string;
  warehouseCode: string;
  allocated: number;
  available: number;
  availableAfterReserve: number;
  wouldBeNegative: boolean;
}

interface LineWithStockInfo {
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  allocations: AllocationWithStock[];
  hasNegativeStock: boolean;
}

import { TableCardComponent } from '@shared/components/ui/table-card/table-card.component';
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
    TableCardComponent,
    TranslateOptionsPipe,
    TranslatePipe,
    LocalizedNumberPipe,
    CommonModule,
    ButtonModule,
    SelectModule,
    FormsModule,
    TableModule,
    TooltipModule,
    InputNumberModule,
    PasswordModule,
    RadioButtonModule,
    DocumentConfirmationDialogComponent,
  ],
  templateUrl: './convert-to-invoice-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConvertToInvoiceDialogComponent implements OnChanges {
  readonly locale = inject(LanguageService).locale;

  private readonly api = inject(QuoteApiService);
  private requestVersion = 0;
  private readonly receivablesApi = inject(ReceivablesApiService);
  private readonly balanceApi = inject(CustomerBalanceApiService);
  private readonly paymentMethodApi = inject(PaymentMethodApiService);

  readonly visible = input<boolean>(false);
  readonly quoteId = input<string | null>(null);

  readonly paymentType = signal<PaymentType>(PaymentType.CASH);
  readonly paymentTypeOptions = Object.values(PaymentType).map((pt) => ({
    label: PAYMENT_TYPE_LABELS[pt],
    value: pt,
  }));

  readonly confirmed = output<ConvertToInvoiceRequest>();
  readonly cancelled = output<void>();

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly lines = signal<LineWithStockInfo[]>([]);
  readonly quoteInfo = signal<{ number: string; customerName: string; subtotal: number } | null>(
    null,
  );
  readonly quoteCustomerId = signal<string | null>(null);
  readonly hasAnyNegativeStock = signal(false);
  readonly confirmationModel = computed<DocumentConfirmationModel>(() => ({
    title: 'sales.orders.convertToInvoice2',
    subtitle: 'shared.availableStockWillBeCheckedBeforeGeneratingTheOrder',
    icon: 'pi-file',
    acceptLabel: 'sales.orders.convertToInvoice2',
    acceptIcon: 'pi pi-file',
    permissionAction: 'CREATE',
    permissionModule: BusinessModule.FINANCE_INVOICES,
  }));

  readonly creditStatus = signal<CreditStatusResponse | null>(null);
  readonly creditLoading = signal(false);

  readonly totalAmount = computed(() => this.quoteInfo()?.subtotal ?? 0);

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
        `El total (${total.toLocaleString()}) excede el crédito disponible (${status.availableCredit.toLocaleString()}) por ${deficit.toLocaleString()}.`,
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

  readonly maxPaymentPerLine = computed(() => {
    const balanceUsed = this.useBalance()
      ? Math.min(this.customerBalance(), this.totalAmount())
      : 0;
    const alreadyAssigned = this.paymentLines().reduce((s, l) => s + (l.amount || 0), 0);
    return Math.max(0, this.totalAmount() - balanceUsed - alreadyAssigned);
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
    if (
      !this.visible() ||
      this.loading() ||
      this.error() ||
      !this.quoteInfo() ||
      this.hasAnyNegativeStock() ||
      this.isConfirming()
    )
      return false;
    if (this.isCash()) return this.allPaymentsValid();
    if (this.creditLoading()) return false;
    if (this.creditWarningMessage()) return !!this.confirmationPassword();
    return true;
  });

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

  ngOnChanges(): void {
    ++this.requestVersion;
    if (this.visible() && this.quoteId()) {
      this.loadQuoteData();
    }
    if (!this.visible()) {
      this.resetAll();
    }
  }

  private loadQuoteData(): void {
    const id = this.quoteId();
    if (!id) return;

    const version = this.requestVersion;
    this.quoteInfo.set(null);
    this.lines.set([]);
    this.hasAnyNegativeStock.set(true);
    this.loading.set(true);
    this.error.set(null);

    this.api.getById(id).subscribe({
      next: (quote) => {
        if (version !== this.requestVersion) return;
        this.quoteInfo.set({
          number: quote.quoteNumber,
          customerName: quote.customerName,
          subtotal: quote.subtotal,
        });
        this.quoteCustomerId.set(quote.customerId);

        const mappedLines = quote.lines.map((line) => this.mapLineWithStock(line, quote));

        this.lines.set(mappedLines);
        this.hasAnyNegativeStock.set(
          !reviewDocumentStock(
            quote.lines.map((line) => ({
              productId: line.productId,
              productName: line.productName,
              quantity: line.quantity,
              allocations: line.allocations.map((allocation) => ({
                warehouseId: allocation.warehouseId,
                warehouseName: allocation.warehouseName,
                quantity: allocation.allocatedQuantity,
                available:
                  line.warehouseStocks?.find(
                    (stock) => stock.warehouseId === allocation.warehouseId,
                  )?.available ?? 0,
              })),
            })),
          ).valid,
        );
        this.loading.set(false);

        if (this.paymentType() === PaymentType.CREDIT) {
          this.loadCreditStatus(quote.customerId);
        } else if (this.paymentType() === PaymentType.CASH) {
          this.loadCashData(quote.customerId);
        }
      },
      error: (err) => {
        if (version !== this.requestVersion) return;
        this.error.set(
          err?.error?.message || err?.message || 'Error al cargar datos del presupuesto',
        );
        this.loading.set(false);
      },
    });
  }

  private mapLineWithStock(
    line: QuoteDetails['lines'][0],
    _quote: QuoteDetails,
  ): LineWithStockInfo {
    const allocations: AllocationWithStock[] = line.allocations.map((wa) => {
      const stockInfo = line.warehouseStocks?.find((ws) => ws.warehouseId === wa.warehouseId);

      const available = stockInfo?.available ?? 0;
      const availableAfterReserve = available - wa.allocatedQuantity;
      const wouldBeNegative = availableAfterReserve < 0;

      return {
        warehouseName: wa.warehouseName,
        warehouseCode: wa.warehouseCode ?? '',
        allocated: wa.allocatedQuantity,
        available,
        availableAfterReserve,
        wouldBeNegative,
      };
    });

    return {
      productName: line.productName,
      productCode: line.productCode,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      subtotal: line.subtotal,
      allocations,
      hasNegativeStock: allocations.some((a) => a.wouldBeNegative),
    };
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
    const cid = this.quoteCustomerId();
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
    this.lines.set([]);
    this.quoteInfo.set(null);
    this.quoteCustomerId.set(null);
    this.error.set(null);
    this.hasAnyNegativeStock.set(false);
    this.paymentType.set(PaymentType.CASH);
    this.creditStatus.set(null);
    this.creditLoading.set(false);
    this.isConfirming.set(false);
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
