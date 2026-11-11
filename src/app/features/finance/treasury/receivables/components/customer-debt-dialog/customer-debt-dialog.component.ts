import type { ReceivablesSearchParams } from '@features/finance/treasury/receivables/services/api/receivables-api.service';
import { StatusVariant } from '@shared/models/status-variant';
import { invoiceStatusVariant } from '@features/finance/billing/invoices/models/invoice-status.presentation';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { LanguageService } from '@core/i18n/language.service';
import { UserPreferencesService } from '@core/preferences/user-preferences.service';
import {
  ReceivableTone,
  receivableAmountClass,
  invoiceStatusTranslationKey,
  isInvoiceOverdue,
} from '@features/finance/treasury/receivables/components/receivables-presentation';
import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { provideTranslatedMessages } from '@core/i18n/translated-feedback.service';
import { LocalizedDatePipe, LocalizedCurrencyPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
import {
  ListActionButtonsComponent,
  ListAction,
} from '@shared/components/list/list-action-buttons/list-action-buttons.component';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { TextBadgeComponent } from '@shared/components/ui/text-badge/text-badge.component';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';

import { ReceivablesApplicationService } from '@features/finance/treasury/receivables/services/application/receivables-application.service';
import { CustomerInvoiceDebt } from '@features/finance/treasury/receivables/models/interfaces/customer-invoice-debt.interface';
import { CustomerBalanceApiService } from '@features/partners/customers/services/api/customer-balance-api.service';
import { BalanceTransactionResponse } from '@features/partners/customers/models/interfaces/balance-transaction.interface';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';
import { MessageService } from 'primeng/api';
import { ReturnFormDialogComponent } from '@features/finance/billing/returns/components/return-form-dialog/return-form-dialog.component';
import { NoteFormDialogComponent } from '@shared/ui/note-form-dialog/note-form-dialog.component';
import { InvoiceApiService } from '@features/finance/billing/invoices/services/api/invoice-api.service';
import { InvoiceDetails } from '@features/finance/billing/invoices/models/interfaces/invoice-details.interface';
import { PaymentMethodApiService } from '@features/finance/treasury/payment-methods/services/api/payment-method-api.service';
import { catchError, of } from 'rxjs';

type InvoiceStatusFilter =
  | 'ALL'
  | 'PENDING'
  | 'PARTIAL'
  | 'PAID'
  | 'RETURNED'
  | 'CANCELLED'
  | 'PARTIAL_RETURN'
  | 'OVERDUE'
  | 'CURRENT';
type BalanceFilter = 'ALL' | 'CREDITS' | 'USES';

interface StatusFilterOption {
  label: string;
  value: InvoiceStatusFilter;
}

interface BalanceFilterOption {
  label: string;
  value: BalanceFilter;
}

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { listAction } from '@shared/components/list/list-action-builders';
import { CancelButtonComponent } from '@shared/components/ui/cancel-button/cancel-button.component';
import { PaginatorComponent } from '@shared/components/ui/paginator/paginator.component';
@Component({
  selector: 'app-customer-debt-dialog',
  standalone: true,
  imports: [
    PaginatorComponent,
    CancelButtonComponent,
    PanelCardComponent,
    TranslateOptionsPipe,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedCurrencyPipe,
    TextBadgeComponent,
    PermissionDirective,
    ListActionButtonsComponent,
    DialogModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    TooltipModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    FormsModule,
    ReactiveFormsModule,
    ReturnFormDialogComponent,
    NoteFormDialogComponent,
  ],
  providers: [provideTranslatedMessages()],
  templateUrl: './customer-debt-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerDebtDialogComponent {
  readonly locale = inject(LanguageService).locale;
  private readonly preferences = inject(UserPreferencesService);

  protected service = inject(ReceivablesApplicationService);
  private balanceApi = inject(CustomerBalanceApiService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private invoiceApi = inject(InvoiceApiService);
  private paymentMethodApi = inject(PaymentMethodApiService);

  readonly visible = input.required<boolean>();
  readonly customerId = input.required<string>();

  readonly close = output<void>();
  readonly payInvoice = output<CustomerInvoiceDebt>();
  readonly payAll = output<void>();
  readonly payPartial = output<void>();
  readonly viewInvoicePaymentHistory = output<CustomerInvoiceDebt>();
  readonly viewInvoicePdf = output<CustomerInvoiceDebt>();

  protected customer = computed(() => this.service.currentCustomer());
  protected invoices = computed(() => this.service.customerInvoices());
  protected loading = computed(() => this.service.loading());

  protected initialLoadComplete = signal(false);
  protected loadingInvoices = signal(false);
  protected selectedStatusFilter = signal<InvoiceStatusFilter>('ALL');
  protected readonly todayDate = new Date().toISOString().slice(0, 10);

  protected invoiceFirst = signal(0);
  protected invoiceRows = signal(10);
  protected invoiceTotalRecords = signal(0);

  protected allInvoicesFullyBlocked = computed(
    () =>
      this.invoices().length > 0 && this.invoices().every((inv) => this.isInvoiceFullyBlocked(inv)),
  );

  protected readonly statusFilterOptions: StatusFilterOption[] = [
    { label: 'finance.treasury.receivables.allStatuses', value: 'ALL' },
    { label: 'finance.treasury.receivables.pending', value: 'PENDING' },
    { label: 'finance.treasury.receivables.partial', value: 'PARTIAL' },
    { label: 'finance.treasury.receivables.paid', value: 'PAID' },
    { label: 'finance.treasury.receivables.returned', value: 'RETURNED' },
    { label: 'finance.treasury.receivables.partiallyReturned', value: 'PARTIAL_RETURN' },
    { label: 'finance.treasury.receivables.cancelled', value: 'CANCELLED' },
    { label: 'finance.treasury.receivables.overdue', value: 'OVERDUE' },
    { label: 'finance.treasury.receivables.current', value: 'CURRENT' },
  ];

  protected balance = signal<number>(0);
  protected transactions = signal<BalanceTransactionResponse[]>([]);
  protected loadingBalance = signal(false);
  protected loadingTransactions = signal(false);
  protected balanceFirst = signal(0);
  protected balanceRows = signal(10);
  protected balanceTotalRecords = signal(0);
  protected selectedBalanceFilter = signal<BalanceFilter>('ALL');

  protected readonly balanceFilterOptions: BalanceFilterOption[] = [
    { label: 'Créditos', value: 'CREDITS' },
    { label: 'Usados', value: 'USES' },
  ];

  protected showAdvanceDialog = signal(false);
  protected creatingAdvance = signal(false);
  protected paymentMethods = signal<{ label: string; value: string }[]>([]);
  protected advanceForm: FormGroup = this.fb.group({
    amount: [null, [Validators.required, Validators.min(0.01)]],
    paymentMethodId: [null, Validators.required],
    notes: [''],
  });

  protected showRefundDialog = signal(false);
  protected creatingRefund = signal(false);
  protected refundForm: FormGroup = this.fb.group({
    amount: [null, [Validators.required, Validators.min(0.01)]],
    paymentMethodId: [null, Validators.required],
    notes: [''],
  });

  protected showReturnDialog = signal(false);
  protected showNoteDialog = signal(false);
  protected selectedInvoiceDetails = signal<InvoiceDetails | null>(null);
  protected loadingReturnInvoice = signal(false);
  protected loadingNoteInvoice = signal(false);

  constructor() {
    this.loadPaymentMethods();
    effect(() => {
      const isVisible = this.visible();
      const id = this.customerId();
      if (isVisible && id) {
        this.loadCustomerData(id);
        this.loadBalanceData(id);
      }
    });
  }

  protected onClose(): void {
    this.service.clearCurrentCustomer();
    this.close.emit();
  }

  protected onVisibleChange(isVisible: boolean): void {
    if (!isVisible) {
      this.onClose();
    }
  }

  refreshVisibleDetails(): void {
    if (this.visible() && this.customerId()) {
      this.loadCustomerData(this.customerId());
      this.loadBalanceData(this.customerId());
    }
  }

  openBalanceAction(action: 'refund' | 'advance', customerId: string): void {
    this.balanceApi.getBalance(customerId).subscribe({
      next: (response) => {
        this.balance.set(response.totalBalance);
        if (action === 'refund') this.onCreateRefund();
        else this.onCreateAdvance();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el saldo del cliente',
        });
      },
    });
  }

  protected invoiceActions(invoice: CustomerInvoiceDebt): ListAction[] {
    const actions: ListAction[] = [
      listAction('Ver factura', 'READ', 'file-pdf', () => this.onViewInvoicePdf(invoice)),
      listAction('Ver historial de pagos', 'READ', 'history', () =>
        this.onViewInvoicePaymentHistory(invoice),
      ),
    ];
    if (this.canReturnInvoice(invoice)) {
      actions.push(
        listAction('Devolución', 'CREATE', 'undo', () => this.onViewInvoiceReturns(invoice), {
          module: BusinessModule.FINANCE_RETURNS,
          disabled: this.loadingReturnInvoice(),
        }),
        listAction('Nota', 'CREATE', 'file-edit', () => this.onViewInvoiceNotes(invoice), {
          disabled: this.loadingNoteInvoice(),
        }),
      );
    }
    if (invoice.balance > 0 && !this.isInvoiceFullyBlocked(invoice)) {
      actions.push(
        listAction('Registrar pago', 'EXECUTE', 'dollar', () => this.onPayInvoice(invoice)),
      );
    }
    return actions;
  }

  protected onPayInvoice(invoice: CustomerInvoiceDebt): void {
    this.payInvoice.emit(invoice);
  }

  protected onPayAll(): void {
    this.payAll.emit();
  }

  protected onPayPartial(): void {
    this.payPartial.emit();
  }

  protected onViewInvoicePaymentHistory(invoice: CustomerInvoiceDebt): void {
    this.viewInvoicePaymentHistory.emit(invoice);
  }

  protected onViewInvoicePdf(invoice: CustomerInvoiceDebt): void {
    this.viewInvoicePdf.emit(invoice);
  }

  protected onStatusFilterChange(filter: InvoiceStatusFilter): void {
    this.selectedStatusFilter.set(filter);
    this.invoiceFirst.set(0);
    this.loadInvoicesForCurrentFilter();
  }

  protected onInvoicePageChange(event: { first?: number; rows?: number }): void {
    this.invoiceFirst.set(event.first ?? 0);
    this.invoiceRows.set(event.rows ?? 10);
    this.loadInvoicesForCurrentFilter();
  }

  protected getStatusLabel(status: string): string {
    return invoiceStatusTranslationKey(status);
  }

  protected getStatusVariant(status: string): StatusVariant {
    return invoiceStatusVariant(status);
  }

  protected amountColor(tone: ReceivableTone): string {
    return receivableAmountClass(this.preferences.colorMode() === 'informative', tone);
  }

  protected isOverdue(invoice: CustomerInvoiceDebt): boolean {
    return isInvoiceOverdue(invoice, this.todayDate);
  }

  protected isInvoiceFullyBlocked(_invoice: CustomerInvoiceDebt): boolean {
    return false;
  }

  protected isInvoicePartiallyBlocked(_invoice: CustomerInvoiceDebt): boolean {
    return false;
  }

  protected getPayTooltip(_invoice: CustomerInvoiceDebt): string {
    return 'Registrar pago';
  }

  protected canReturnInvoice(invoice: CustomerInvoiceDebt): boolean {
    return invoice.status !== 'CANCELLED' && invoice.status !== 'FULLY_RETURNED';
  }

  protected onViewInvoiceReturns(invoice: CustomerInvoiceDebt): void {
    this.loadingReturnInvoice.set(true);
    this.invoiceApi.getById(invoice.invoiceId).subscribe({
      next: (details) => {
        this.selectedInvoiceDetails.set(details);
        this.showReturnDialog.set(true);
        this.loadingReturnInvoice.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los detalles de la factura',
        });
        this.loadingReturnInvoice.set(false);
      },
    });
  }

  protected onReturnDialogConfirmed(): void {
    this.showReturnDialog.set(false);
    this.selectedInvoiceDetails.set(null);
    const customerId = this.customerId();
    if (customerId) {
      this.loadInvoicesForCurrentFilter();
    }
  }

  protected onReturnDialogDismissed(): void {
    this.showReturnDialog.set(false);
    this.selectedInvoiceDetails.set(null);
  }

  protected onViewInvoiceNotes(invoice: CustomerInvoiceDebt): void {
    this.loadingNoteInvoice.set(true);
    this.invoiceApi.getById(invoice.invoiceId).subscribe({
      next: (details) => {
        this.selectedInvoiceDetails.set(details);
        this.showNoteDialog.set(true);
        this.loadingNoteInvoice.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los detalles de la factura',
        });
        this.loadingNoteInvoice.set(false);
      },
    });
  }

  protected onNoteDialogConfirmed(): void {
    this.showNoteDialog.set(false);
    this.selectedInvoiceDetails.set(null);
    const customerId = this.customerId();
    if (customerId) {
      this.loadInvoicesForCurrentFilter();
    }
  }

  protected onNoteDialogDismissed(): void {
    this.showNoteDialog.set(false);
    this.selectedInvoiceDetails.set(null);
  }

  protected getBalanceTypeLabel(type: string): string {
    switch (type) {
      case 'ADVANCED':
        return 'Anticipo';
      case 'RETURNS':
        return 'Devolución';
      case 'PAYMENTS':
        return 'Pago';
      case 'INVOICES':
        return 'Factura';
      case 'REFUND':
        return 'Reintegro';
      case 'CREDIT_NOTE':
        return 'Nota de Crédito';
      default:
        return type;
    }
  }

  protected getBalanceTypeVariant(
    type: string,
  ): 'success' | 'warning' | 'danger' | 'info' | 'label' {
    switch (type) {
      case 'ADVANCED':
        return 'info';
      case 'RETURNS':
        return 'warning';
      case 'PAYMENTS':
        return 'success';
      case 'INVOICES':
        return 'label';
      case 'REFUND':
        return 'danger';
      case 'CREDIT_NOTE':
        return 'info';
      default:
        return 'info';
    }
  }

  protected isPositive(type: string): boolean {
    return (
      type === 'ADVANCED' || type === 'RETURNS' || type === 'PAYMENTS' || type === 'CREDIT_NOTE'
    );
  }

  protected isNegative(type: string): boolean {
    return type === 'INVOICES' || type === 'REFUND';
  }

  protected onBalanceFilterChange(filter: BalanceFilter): void {
    this.selectedBalanceFilter.set(filter);
    this.balanceFirst.set(0);
    this.loadTransactionsForCurrentFilter();
  }

  protected onBalancePageChange(event: { first?: number; rows?: number }): void {
    this.balanceFirst.set(event.first ?? 0);
    this.balanceRows.set(event.rows ?? 10);
    this.loadTransactionsForCurrentFilter();
  }

  protected onCreateAdvance(): void {
    this.advanceForm.reset({
      amount: null,
      paymentMethodId: this.defaultPaymentMethod(),
      notes: '',
    });
    this.showAdvanceDialog.set(true);
  }

  protected onCancelAdvance(): void {
    this.showAdvanceDialog.set(false);
    this.advanceForm.reset();
  }

  protected onAdvanceVisibleChange(visible: boolean): void {
    if (!visible) {
      this.advanceForm.reset();
    }
  }

  protected submitAdvance(): void {
    if (this.advanceForm.invalid) return;
    const amount = this.advanceForm.get('amount')?.value;
    const notes = this.advanceForm.get('notes')?.value;
    const paymentMethodId = this.advanceForm.get('paymentMethodId')?.value;
    const customerId = this.customerId();
    if (!amount || amount <= 0 || !customerId || !paymentMethodId) return;

    this.creatingAdvance.set(true);
    this.balanceApi
      .createAdvance(customerId, {
        amount,
        paymentMethodId,
        notes: notes || undefined,
      })
      .subscribe({
        next: (response) => {
          this.balance.set(response.totalBalance);
          this.showAdvanceDialog.set(false);
          this.service.loadCustomerDebt(customerId).subscribe();
          this.service.customerDebtChange.next();
          this.messageService.add({
            severity: 'success',
            summary: 'Anticipo registrado',
            detail: `Se agregaron $${amount.toFixed(2)} al balance del cliente`,
          });
          this.loadTransactionsForCurrentFilter();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo registrar el anticipo',
          });
          this.creatingAdvance.set(false);
        },
        complete: () => this.creatingAdvance.set(false),
      });
  }

  protected onCreateRefund(): void {
    this.refundForm.reset({
      amount: null,
      paymentMethodId: this.defaultPaymentMethod(),
      notes: '',
    });
    this.showRefundDialog.set(true);
  }

  protected onCancelRefund(): void {
    this.showRefundDialog.set(false);
    this.refundForm.reset();
  }

  protected onRefundVisibleChange(visible: boolean): void {
    if (!visible) {
      this.refundForm.reset();
    }
  }

  protected submitRefund(): void {
    if (this.refundForm.invalid) return;
    const amount = this.refundForm.get('amount')?.value;
    const paymentMethodId = this.refundForm.get('paymentMethodId')?.value;
    const notes = this.refundForm.get('notes')?.value;
    const customerId = this.customerId();
    if (!amount || amount <= 0 || !customerId || !paymentMethodId) return;

    this.creatingRefund.set(true);
    this.balanceApi
      .createRefund(customerId, { amount, paymentMethodId, notes: notes || undefined })
      .subscribe({
        next: (response) => {
          this.balance.set(response.totalBalance);
          this.showRefundDialog.set(false);
          this.service.loadCustomerDebt(customerId).subscribe();
          this.service.customerDebtChange.next();
          this.messageService.add({
            severity: 'success',
            summary: 'Reintegro realizado',
            detail: `Se reintegraron $${amount.toFixed(2)} al cliente`,
          });
          this.loadTransactionsForCurrentFilter();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo realizar el reintegro',
          });
          this.creatingRefund.set(false);
        },
        complete: () => this.creatingRefund.set(false),
      });
  }

  private loadPaymentMethods(): void {
    this.paymentMethodApi
      .getAll({ active: true, size: 100 })
      .pipe(
        catchError(() =>
          of({ content: [] } as unknown as PagedResponse<
            import('@features/finance/treasury/payment-methods/models/interfaces').PaymentMethodList
          >),
        ),
      )
      .subscribe((response) => {
        this.paymentMethods.set(
          response.content.map((method) => ({ label: method.name, value: method.id })),
        );
      });
  }

  private defaultPaymentMethod(): string | null {
    return this.paymentMethods()[0]?.value ?? null;
  }

  private loadCustomerData(customerId: string): void {
    this.service.loadCustomerDebt(customerId).subscribe();
    this.loadInvoices(customerId, 'ALL', true);
  }

  private loadInvoicesForCurrentFilter(): void {
    const id = this.customerId();
    if (id) {
      this.loadInvoices(id, this.selectedStatusFilter());
    }
  }

  private loadInvoices(
    customerId: string,
    status: InvoiceStatusFilter,
    isInitialLoad = false,
  ): void {
    this.loadingInvoices.set(true);
    const first = this.invoiceFirst();
    const rows = this.invoiceRows();

    const params: ReceivablesSearchParams = {
      page: Math.floor(first / rows),
      size: rows,
    };
    if (status !== 'ALL') {
      params.status = status;
    }

    this.service.loadCustomerInvoices(customerId, params).subscribe({
      next: () => {
        this.invoiceTotalRecords.set(this.service.totalCustomerInvoices());
        this.loadingInvoices.set(false);
        if (isInitialLoad) {
          this.initialLoadComplete.set(true);
        }
      },
      error: () => {
        this.loadingInvoices.set(false);
        if (isInitialLoad) {
          this.initialLoadComplete.set(true);
        }
      },
    });
  }

  private loadBalanceData(customerId: string): void {
    this.loadingBalance.set(true);
    this.balanceApi.getBalance(customerId).subscribe({
      next: (response) => {
        this.balance.set(response.totalBalance);
        this.loadingBalance.set(false);
      },
      error: () => {
        this.balance.set(0);
        this.loadingBalance.set(false);
      },
    });
    this.loadTransactionsForCurrentFilter();
  }

  private loadTransactionsForCurrentFilter(): void {
    const customerId = this.customerId();
    if (!customerId) return;

    this.loadingTransactions.set(true);
    const first = this.balanceFirst();
    const rows = this.balanceRows();
    const filter = this.selectedBalanceFilter();

    this.balanceApi.getTransactions(customerId, Math.floor(first / rows), rows).subscribe({
      next: (response: PagedResponse<BalanceTransactionResponse>) => {
        let filtered = response.content;

        if (filter === 'CREDITS') {
          filtered = filtered.filter((t) => this.isPositive(t.type));
        } else if (filter === 'USES') {
          filtered = filtered.filter((t) => this.isNegative(t.type));
        }

        this.transactions.set(filtered);
        this.balanceTotalRecords.set(filter === 'ALL' ? response.totalElements : filtered.length);
        this.loadingTransactions.set(false);
      },
      error: () => {
        this.transactions.set([]);
        this.balanceTotalRecords.set(0);
        this.loadingTransactions.set(false);
      },
    });
  }
}
