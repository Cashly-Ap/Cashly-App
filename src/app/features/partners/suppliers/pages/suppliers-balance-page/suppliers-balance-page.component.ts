import { LocalizedCurrencyPipe } from '@core/i18n/localized-format.pipe';
import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { NavigationHistoryService } from '@core/navigation/navigation-history.service';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription, catchError, distinctUntilChanged, forkJoin, map, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SupplierBalanceApiService } from '@features/partners/suppliers/services/api/supplier-balance-api.service';
import { PayablesApiService } from '@features/finance/treasury/payables/services/api/payables-api.service';
import { SupplierBalanceResponse } from '@features/partners/suppliers/models/interfaces/supplier-balance.interface';
import { SupplierBalanceTransactionResponse } from '@features/partners/suppliers/models/interfaces/supplier-balance-transaction.interface';
import { SupplierList } from '@features/partners/suppliers/models/interfaces/supplier-list.interface';
import { SupplierPickerDialogComponent } from '@features/procurement/purchases/components/supplier-picker-dialog/supplier-picker-dialog.component';
import { SupplierBalanceSummaryCardComponent } from '@features/partners/suppliers/components/supplier-balance-summary-card/supplier-balance-summary-card.component';
import { SupplierBalanceTransactionsTableComponent } from '@features/partners/suppliers/components/supplier-balance-transactions-table/supplier-balance-transactions-table.component';
import { ListFilterComponent } from '@shared/components/list/list-filter/list-filter.component';
import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { BackButtonComponent } from '@shared/components/ui/back-button/back-button.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

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
  selector: 'app-suppliers-balance-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    TranslateOptionsPipe,
    LocalizedCurrencyPipe,
    PageHeaderComponent,
    ButtonModule,
    DatePickerModule,
    InputNumberModule,
    InputTextModule,
    PopoverModule,
    SelectModule,
    TooltipModule,
    ListFilterComponent,
    PanelCardComponent,
    BackButtonComponent,
    SupplierPickerDialogComponent,
    SupplierBalanceSummaryCardComponent,
    SupplierBalanceTransactionsTableComponent,
  ],
  templateUrl: './suppliers-balance-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuppliersBalancePageComponent implements OnInit {
  private readonly navigationHistory = inject(NavigationHistoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly balanceApi = inject(SupplierBalanceApiService);
  private readonly payablesApi = inject(PayablesApiService);

  private supplierRequests = new Subscription();
  private readonly supplierId = signal<string | null>(null);
  readonly supplierPickerVisible = signal(false);

  readonly supplierName = signal('');
  readonly supplierAlias = signal('');
  readonly balance = signal<SupplierBalanceResponse | null>(null);
  readonly pendingBalance = signal(0);
  private readonly allTransactions = signal<SupplierBalanceTransactionResponse[]>([]);
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
    { label: 'partners.suppliers.balanceAdvanced', value: 'ADVANCED' },
    { label: 'partners.suppliers.balanceReturns', value: 'RETURNS' },
    { label: 'partners.suppliers.balancePayments', value: 'PAYMENTS' },
    { label: 'partners.suppliers.balancePurchases', value: 'INVOICES' },
    { label: 'partners.suppliers.balanceRefund', value: 'REFUND' },
    { label: 'partners.suppliers.balanceCreditNote', value: 'CREDIT_NOTE' },
    { label: 'partners.suppliers.balanceDebitNote', value: 'DEBIT_NOTE' },
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
      const transactionDate = transaction.createdAt ? new Date(transaction.createdAt).getTime() : 0;
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
    this.destroyRef.onDestroy(() => this.supplierRequests.unsubscribe());
    this.route.paramMap
      .pipe(
        map((params) => params.get('id')),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((supplierId) => {
        this.supplierRequests.unsubscribe();
        this.supplierRequests = new Subscription();
        this.supplierId.set(supplierId);
        this.supplierName.set('');
        this.supplierAlias.set('');
        this.balance.set(null);
        this.pendingBalance.set(0);
        this.allTransactions.set([]);
        this.clearFilters();
        if (!supplierId) {
          void this.router.navigate(['/partners/suppliers']);
          return;
        }
        this.supplierRequests.add(this.loadSupplierInfo(supplierId));
        this.supplierRequests.add(this.loadAccountStatement(supplierId));
      });
  }

  onBack(): void {
    this.navigationHistory.back(['/partners/suppliers']);
  }

  onSupplierSelected(supplier: SupplierList): void {
    this.supplierPickerVisible.set(false);
    void this.router.navigate(['/partners/suppliers', supplier.id, 'balance']);
  }

  onPageChange(event: { first: number; rows: number }): void {
    this.pageSize.set(event.rows ?? 10);
    this.page.set(Math.floor((event.first ?? 0) / (event.rows ?? 10)));
  }

  applyFilters(): void {
    this.page.set(0);
    this.appliedFilters.set({
      dateFrom: this.filterDateFrom(),
      dateTo: this.filterDateTo(),
      type: this.filterType(),
      number: this.filterNumber(),
      reference: this.filterReference(),
      amount: this.filterAmount(),
    });
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

  private loadSupplierInfo(id: string): Subscription {
    return this.payablesApi.getSupplierDebt(id).subscribe({
      next: (supplier) => {
        this.supplierName.set(supplier.supplierName);
        this.supplierAlias.set(supplier.supplierRif);
        this.pendingBalance.set(supplier.totalDebt);
      },
    });
  }

  private loadAccountStatement(id: string): Subscription {
    this.transactionsLoading.set(true);
    return forkJoin({
      balance: this.balanceApi
        .getBalance(id)
        .pipe(catchError(() => of(null as SupplierBalanceResponse | null))),
      transactions: this.balanceApi
        .getTransactions(id, 0, 1000)
        .pipe(catchError(() => of(this.emptyPage<SupplierBalanceTransactionResponse>()))),
    }).subscribe({
      next: ({
        balance,
        transactions,
      }: {
        balance: SupplierBalanceResponse | null;
        transactions: PagedResponse<SupplierBalanceTransactionResponse>;
      }) => {
        this.balance.set(balance);
        this.allTransactions.set(transactions.content ?? []);
        this.transactionsLoading.set(false);
      },
      error: () => this.transactionsLoading.set(false),
    });
  }

  private startOfDay(date: Date): number {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    return value.getTime();
  }

  private endOfDay(date: Date): number {
    const value = new Date(date);
    value.setHours(23, 59, 59, 999);
    return value.getTime();
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
}
