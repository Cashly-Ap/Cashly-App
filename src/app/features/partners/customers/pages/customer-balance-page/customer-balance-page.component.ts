import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { NavigationHistoryService } from '@core/navigation/navigation-history.service';
import { ShortcutDirective } from '@core/shortcuts/shortcut.directive';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomerPickerDialogComponent } from '@features/sales/orders/components/customer-picker-dialog/customer-picker-dialog.component';
import { CustomerList } from '@features/partners/customers/models/interfaces/customer-list.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { CustomerBalanceApiService } from '@features/partners/customers/services/api/customer-balance-api.service';
import { CustomerApiService } from '@features/partners/customers/services/api/customer-api.service';
import { CustomerBalanceResponse } from '@features/partners/customers/models/interfaces/customer-balance.interface';
import { BalanceTransactionResponse } from '@features/partners/customers/models/interfaces/balance-transaction.interface';
import { BalanceSummaryCardComponent } from '@features/partners/customers/components/balance-summary-card/balance-summary-card.component';
import { BalanceTransactionsTableComponent } from '@features/partners/customers/components/balance-transactions-table/balance-transactions-table.component';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';
import { InvoiceApiService } from '@features/finance/billing/invoices/services/api/invoice-api.service';
import { ReceivablesApiService } from '@features/finance/treasury/receivables/services/api/receivables-api.service';
import { PendingPayment } from '@features/finance/treasury/receivables/models/interfaces/pending-payment.interface';
import { CreditNoteApiService } from '@features/finance/billing/credit-notes/services/api/credit-note-api.service';
import { DebitNoteApiService } from '@features/finance/billing/debit-notes/services/api/debit-note-api.service';
import { ReturnApiService } from '@features/finance/billing/returns/services/api/return-api.service';
import { InvoiceStatus } from '@features/finance/billing/invoices/models/enums/invoice-status.enum';
import { catchError, distinctUntilChanged, forkJoin, map, of, Subscription } from 'rxjs';

interface BalanceTransactionFilters {
  dateFrom: Date | null;
  dateTo: Date | null;
  type: string | null;
  number: string;
  reference: string;
  amount: number | null;
}

const EMPTY_FILTERS: BalanceTransactionFilters = {
  dateFrom: null,
  dateTo: null,
  type: null,
  number: '',
  reference: '',
  amount: null,
};

@Component({
  selector: 'app-customer-balance-page',
  standalone: true,
  imports: [TranslateOptionsPipe, TranslatePipe,
    CustomerPickerDialogComponent,
    ShortcutDirective,
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    ButtonModule,
    DatePickerModule,
    InputNumberModule,
    InputTextModule,
    PopoverModule,
    SelectModule,
    TooltipModule,
    BalanceSummaryCardComponent,
    BalanceTransactionsTableComponent,
  ],
  templateUrl: './customer-balance-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerBalancePageComponent implements OnInit {
  private readonly navigationHistory = inject(NavigationHistoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private customerRequests = new Subscription();
  private readonly customerId = signal<string | null>(null);
  readonly customerPickerVisible = signal(false);
  private readonly router = inject(Router);
  private readonly balanceApi = inject(CustomerBalanceApiService);
  private readonly customerApi = inject(CustomerApiService);
  private readonly invoiceApi = inject(InvoiceApiService);
  private readonly receivablesApi = inject(ReceivablesApiService);
  private readonly creditNoteApi = inject(CreditNoteApiService);
  private readonly debitNoteApi = inject(DebitNoteApiService);
  private readonly returnApi = inject(ReturnApiService);
  private readonly messageService = inject(MessageService);

  readonly customerName = signal('');
  readonly customerAlias = signal('');
  readonly balance = signal<CustomerBalanceResponse | null>(null);
  readonly pendingBalance = signal(0);
  private readonly allTransactions = signal<BalanceTransactionResponse[]>([]);
  readonly transactionsLoading = signal(false);
  readonly page = signal(0);
  readonly pageSize = signal(10);
  readonly filterDateFrom = signal<Date | null>(null);
  readonly filterDateTo = signal<Date | null>(null);
  readonly filterType = signal<string | null>(null);
  readonly filterNumber = signal('');
  readonly filterReference = signal('');
  readonly filterAmount = signal<number | null>(null);
  private readonly appliedFilters = signal<BalanceTransactionFilters>({ ...EMPTY_FILTERS });
  readonly transactionTypeOptions = [
    { label: 'Anticipo', value: 'ADVANCED' },
    { label: 'Devolución', value: 'RETURNS' },
    { label: 'Pago', value: 'PAYMENTS' },
    { label: 'Factura', value: 'INVOICES' },
    { label: 'Reembolso', value: 'REFUND' },
    { label: 'Nota de Crédito', value: 'CREDIT_NOTE' },
    { label: 'Nota de Débito', value: 'DEBIT_NOTE' },
  ];
  readonly activeFilterCount = computed(() => {
    const filters = this.appliedFilters();
    return [
      filters.dateFrom,
      filters.dateTo,
      filters.type,
      filters.number,
      filters.reference,
      filters.amount,
    ].filter((value) => value !== null && value !== '').length;
  });
  private readonly filteredTransactions = computed(() => {
    const filters = this.appliedFilters();
    const number = filters.number.trim().toLocaleLowerCase();
    const reference = filters.reference.trim().toLocaleLowerCase();
    const dateFrom = filters.dateFrom ? this.startOfDay(filters.dateFrom) : null;
    const dateTo = filters.dateTo ? this.endOfDay(filters.dateTo) : null;

    return this.allTransactions().filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt).getTime();
      const matchesDateFrom = dateFrom === null || transactionDate >= dateFrom;
      const matchesDateTo = dateTo === null || transactionDate <= dateTo;
      const matchesType = !filters.type || transaction.type === filters.type;
      const matchesNumber =
        !number || (transaction.number ?? '').toLocaleLowerCase().includes(number);
      const matchesReference =
        !reference || (transaction.referenceNumber ?? '').toLocaleLowerCase().includes(reference);
      const matchesAmount =
        filters.amount === null ||
        Math.abs(Math.abs(transaction.amount) - Math.abs(filters.amount)) < 0.005;

      return (
        matchesDateFrom &&
        matchesDateTo &&
        matchesType &&
        matchesNumber &&
        matchesReference &&
        matchesAmount
      );
    });
  });
  readonly totalRecords = computed(() => this.filteredTransactions().length);
  readonly transactions = computed(() => {
    const first = this.page() * this.pageSize();
    return this.filteredTransactions().slice(first, first + this.pageSize());
  });

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => this.customerRequests.unsubscribe());
    this.route.paramMap
      .pipe(
        map((params) => params.get('id')),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((customerId) => {
        this.customerRequests.unsubscribe();
        this.customerRequests = new Subscription();
        this.customerId.set(customerId);
        this.customerName.set('');
        this.customerAlias.set('');
        this.balance.set(null);
        this.pendingBalance.set(0);
        this.allTransactions.set([]);
        this.clearFilters();
        if (!customerId) {
          void this.router.navigate(['/partners/customers']);
          return;
        }
        this.customerRequests.add(this.loadCustomerInfo(customerId));
        this.customerRequests.add(this.loadAccountStatement(customerId));
      });
  }

  onCustomerSelected(customer: CustomerList): void {
    this.customerPickerVisible.set(false);
    void this.router.navigate(['/partners/customers', customer.id, 'balance']);
  }

  private loadCustomerInfo(id: string): Subscription {
    return this.customerApi.getById(id).subscribe({
      next: (customer) => {
        this.customerName.set(customer.legalName);
        this.customerAlias.set(customer.alias ?? '');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar la información del cliente.',
          life: 5000,
        });
      },
    });
  }

  private loadAccountStatement(id: string): Subscription {
    this.transactionsLoading.set(true);
    return forkJoin({
      balance: this.balanceApi.getBalance(id).pipe(catchError(() => of(null))),
      balanceTransactions: this.balanceApi
        .getTransactions(id, 0, 1000)
        .pipe(catchError(() => of(this.emptyPage<BalanceTransactionResponse>()))),
      invoices: this.invoiceApi.getAll({ customerId: id }).pipe(catchError(() => of([]))),
      payments: this.receivablesApi
        .getCustomerPaymentHistory(id, { page: 0, size: 1000 })
        .pipe(catchError(() => of(this.emptyPage<PendingPayment>()))),
      creditNotes: this.creditNoteApi.getAll({ customerId: id }).pipe(catchError(() => of([]))),
      debitNotes: this.debitNoteApi.getAll({ customerId: id }).pipe(catchError(() => of([]))),
      returns: this.returnApi.getAll({ customerId: id }).pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({
        balance,
        balanceTransactions,
        invoices,
        payments,
        creditNotes,
        debitNotes,
        returns,
      }) => {
        this.balance.set(balance);
        this.pendingBalance.set(
          invoices
            .filter(
              (invoice) =>
                invoice.status === InvoiceStatus.PENDING_PAYMENT ||
                invoice.status === InvoiceStatus.PARTIALLY_PAID,
            )
            .reduce((total, invoice) => total + Math.max(0, invoice.total - invoice.paidAmount), 0),
        );

        const invoiceMovements: BalanceTransactionResponse[] = invoices
          .filter(
            (invoice) =>
              invoice.status !== InvoiceStatus.DRAFT && invoice.status !== InvoiceStatus.CANCELLED,
          )
          .map((invoice) => ({
            id: invoice.id,
            customerId: id,
            type: 'INVOICES',
            amount: invoice.subtotal,
            referenceType: 'INVOICES',
            referenceId: invoice.id,
            number: invoice.invoiceNumber,
            referenceNumber: invoice.statusLabel,
            createdBy: '',
            createdAt: invoice.createdAt,
          }));

        const paymentMovements: BalanceTransactionResponse[] = payments.content
          .filter((payment) => payment.status === 'APPLIED')
          .map((payment) => ({
            id: payment.id,
            customerId: id,
            type: 'PAYMENTS',
            amount: -Math.abs(payment.amount),
            referenceType: 'PAYMENTS',
            referenceId: payment.id,
            number: payment.paymentNumber,
            referenceNumber: payment.invoiceNumber,
            createdBy: '',
            createdAt: payment.createdAt,
          }));

        const creditNoteMovements: BalanceTransactionResponse[] = creditNotes.map((note) => ({
          id: note.id,
          customerId: id,
          type: 'CREDIT_NOTE',
          amount: -Math.abs(note.amount),
          referenceType: 'CREDIT_NOTE',
          referenceId: note.id,
          number: note.noteNumber,
          referenceNumber: note.invoiceNumber,
          createdBy: '',
          createdAt: note.createdAt,
        }));

        const debitNoteMovements: BalanceTransactionResponse[] = debitNotes.map((note) => ({
          id: note.id,
          customerId: id,
          type: 'DEBIT_NOTE',
          amount: Math.abs(note.amount),
          referenceType: 'DEBIT_NOTE',
          referenceId: note.id,
          number: note.noteNumber,
          referenceNumber: note.invoiceNumber,
          createdBy: '',
          createdAt: note.createdAt,
        }));

        const returnMovements: BalanceTransactionResponse[] = returns.map((customerReturn) => ({
          id: customerReturn.id,
          customerId: id,
          type: 'RETURNS',
          amount: -Math.abs(customerReturn.totalAmount),
          referenceType: 'RETURNS',
          referenceId: customerReturn.id,
          number: customerReturn.returnNumber,
          referenceNumber: customerReturn.invoiceNumber,
          createdBy: '',
          createdAt: customerReturn.createdAt,
        }));

        const independentBalanceMovements = balanceTransactions.content.filter(
          (transaction) => transaction.type === 'ADVANCED' || transaction.type === 'REFUND',
        );

        this.allTransactions.set(
          [
            ...invoiceMovements,
            ...paymentMovements,
            ...creditNoteMovements,
            ...debitNoteMovements,
            ...returnMovements,
            ...independentBalanceMovements,
          ].sort(
            (left, right) =>
              new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
          ),
        );
        this.page.set(0);
        this.transactionsLoading.set(false);
      },
      error: () => {
        this.transactionsLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el estado de cuenta del cliente.',
          life: 5000,
        });
      },
    });
  }

  private emptyPage<T>(): PagedResponse<T> {
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 0,
      number: 0,
      first: true,
      last: true,
      empty: true,
    };
  }

  onPageChange(event: { first: number; rows: number }): void {
    this.page.set(Math.floor(event.first / event.rows));
    this.pageSize.set(event.rows);
  }

  applyFilters(): void {
    this.appliedFilters.set({
      dateFrom: this.filterDateFrom(),
      dateTo: this.filterDateTo(),
      type: this.filterType(),
      number: this.filterNumber(),
      reference: this.filterReference(),
      amount: this.filterAmount(),
    });
    this.page.set(0);
  }

  clearFilters(): void {
    this.filterDateFrom.set(null);
    this.filterDateTo.set(null);
    this.filterType.set(null);
    this.filterNumber.set('');
    this.filterReference.set('');
    this.filterAmount.set(null);
    this.appliedFilters.set({ ...EMPTY_FILTERS });
    this.page.set(0);
  }

  private startOfDay(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  }

  private endOfDay(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();
  }

  onBack(): void {
    const customerId = this.customerId();
    if (customerId) {
      this.navigationHistory.back(['/partners/customers', customerId]);
    } else {
      this.navigationHistory.back(['/partners/customers']);
    }
  }
}
