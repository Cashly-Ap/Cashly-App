import { LocalizedCurrencyPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { connectListNavigation } from '@shared/components/list/list-navigation.service';
import {
  ListActionButtonsComponent,
  ListAction,
} from '@shared/components/list/list-action-buttons/list-action-buttons.component';
import {
  Component,
  viewChild,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { PdfViewerService, PdfViewerConfig } from '@core/pdf-viewer';
import { ReceivablesApplicationService } from '@features/finance/treasury/receivables/services/application/receivables-application.service';
import { ReceivablesSearchParams } from '@features/finance/treasury/receivables/services/api/receivables-api.service';
import { CustomerDebtList } from '@features/finance/treasury/receivables/models/interfaces/customer-debt-list.interface';
import { CustomerInvoiceDebt } from '@features/finance/treasury/receivables/models/interfaces/customer-invoice-debt.interface';
import { CustomerDebtDialogComponent } from '@features/finance/treasury/receivables/components/customer-debt-dialog/customer-debt-dialog.component';
import { PaymentFormDialogComponent } from '@features/finance/treasury/receivables/components/payment-form-dialog/payment-form-dialog.component';
import { PaymentHistoryDialogComponent } from '@features/finance/treasury/receivables/components/payment-history-dialog/payment-history-dialog.component';
import { PendingPaymentsTabComponent } from '@features/finance/treasury/receivables/components/pending-payments-tab/pending-payments-tab.component';
import { PaymentSubmitEvent } from '@features/finance/treasury/receivables/components/payment-form-dialog/payment-form-dialog.component';
import { PayPartialDebtRequest } from '@features/finance/treasury/receivables/models/interfaces/payment-request.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';

@Component({
  selector: 'app-receivables-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    LocalizedCurrencyPipe,
    ListActionButtonsComponent,
    CommonModule,
    FormsModule,
    CurrencyPipe,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    TabsModule,
    PaginatorModule,
    SkeletonModule,
    CustomerDebtDialogComponent,
    PaymentFormDialogComponent,
    PaymentHistoryDialogComponent,
    PendingPaymentsTabComponent,
    SearchFieldComponent,
  ],
  templateUrl: './receivables-page.component.html',
})
export class ReceivablesPageComponent implements OnInit, OnDestroy {
  readonly service = inject(ReceivablesApplicationService);
  private readonly pdfViewerService = inject(PdfViewerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly destroy$ = new Subject<void>();
  readonly searchTerm = signal('');
  readonly first = signal(0);
  readonly rows = signal(10);
  readonly sortField = signal<string>('');
  readonly sortOrder = signal<number>(0);

  readonly customerDebtVisible = signal(false);
  readonly selectedCustomer = signal<CustomerDebtList | null>(null);

  readonly paymentFormVisible = signal(false);
  readonly paymentFormMode = signal<'single' | 'all' | 'partial'>('single');
  readonly paymentInvoice = signal<CustomerInvoiceDebt | null>(null);
  readonly paymentCustomerName = signal('');
  readonly paymentTotalDebt = signal(0);
  readonly paymentSubmitting = signal(false);

  readonly activeTab = signal<string>('customers');
  readonly focusPaymentId = signal<string | null>(null);

  readonly paymentHistoryVisible = signal(false);
  readonly paymentHistoryCustomerId = signal('');
  readonly paymentHistoryInvoiceId = signal<string | null>(null);

  readonly showInitialLoading = computed(
    () => this.service.loading() && this.service.customers().length === 0,
  );

  readonly isEmpty = computed(
    () => !this.service.loading() && this.service.totalCustomers() === 0 && !this.searchTerm(),
  );

  readonly hasFilteredResults = computed(
    () => !this.service.loading() && this.service.totalCustomers() === 0 && !!this.searchTerm(),
  );

  private readonly navigationAction = signal<ReceivablesSearchParams['action']>(undefined);
  private readonly listNavigation = connectListNavigation({
    records: () => this.service.customers(),
    loading: () => this.service.loading(),
    total: () => this.service.totalCustomers(),
    first: () => this.first(),
    rows: () => this.rows(),
    onActionChange: (label) => {
      this.navigationAction.set(
        label === 'Pagar todo'
          ? 'PAY_ALL'
          : label === 'Pago parcial'
            ? 'PAY_PARTIAL'
            : label === 'Reintegro'
              ? 'REFUND'
              : undefined,
      );
      if (label === null) this.loadCustomers();
    },
    search: (term) => this.onSearch(term),
    paginate: (event) => this.onPageChange(event),
    label: (record) => record.customerName,
    description: (record) => record.customerRif,
    actions: (record) => this.customerActions(record),
    acceptsAction: (label) =>
      ['Ver deuda', 'Pagar todo', 'Pago parcial', 'Reintegro', 'Generar anticipo'].includes(label),
  });

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const requestedTab = params.get('tab');
      const focusPaymentId = params.get('focus');
      if (requestedTab === 'pending' || focusPaymentId) {
        this.activeTab.set('pending');
      }
      this.focusPaymentId.set(focusPaymentId);
    });

    this.service.loadGlobalSummary().pipe(takeUntil(this.destroy$)).subscribe();
    this.loadCustomers();

    this.service.customerDebtChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.service.loadGlobalSummary().pipe(takeUntil(this.destroy$)).subscribe();
      this.loadCustomers();
    });
  }

  onPaymentFocusHandled(paymentId: string): void {
    if (this.focusPaymentId() !== paymentId) return;
    this.focusPaymentId.set(null);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { focus: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  onPaymentValidated(): void {
    this.service.customerDebtChange.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.first.set(0);
    this.loadCustomers();
  }

  onPageChange(event: { first: number; rows: number }): void {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 10);
    this.loadCustomers();
  }

  toggleSort(field: string): void {
    if (this.sortField() === field) {
      const nextOrder = this.sortOrder() === 0 ? 1 : this.sortOrder() === 1 ? -1 : 0;
      this.sortOrder.set(nextOrder);
      if (nextOrder === 0) this.sortField.set('');
    } else {
      this.sortField.set(field);
      this.sortOrder.set(1);
    }
    this.first.set(0);
    this.loadCustomers();
  }

  sortIcon(field: string): string {
    if (this.sortField() !== field) return 'pi pi-fw pi-sort-alt text-surface-400';
    return this.sortOrder() === 1
      ? 'pi pi-fw pi-sort-up font-bold text-primary'
      : 'pi pi-fw pi-sort-down font-bold text-primary';
  }

  private readonly debtDialog = viewChild.required(CustomerDebtDialogComponent);

  customerActions(customer: CustomerDebtList): ListAction[] {
    return [
      {
        requiredAction: 'READ',
        label: 'Ver deuda',
        icon: 'pi pi-eye',
        command: () => this.onViewCustomerDebt(customer),
      },
      {
        requiredAction: 'EXECUTE',
        label: 'Pagar todo',
        icon: 'pi pi-check-circle',
        disabled: customer.totalDebt <= 0,
        command: () => this.openCustomerPayment(customer, 'all'),
      },
      {
        requiredAction: 'EXECUTE',
        label: 'Pago parcial',
        icon: 'pi pi-percentage',
        disabled: customer.totalDebt <= 0,
        command: () => this.openCustomerPayment(customer, 'partial'),
      },
      {
        requiredAction: 'EXECUTE',
        label: 'Reintegro',
        icon: 'pi pi-undo',
        disabled: customer.customerBalance <= 0,
        command: () => this.openBalanceAction(customer, 'refund'),
      },
      {
        requiredAction: 'EXECUTE',
        label: 'Generar anticipo',
        icon: 'pi pi-plus-circle',
        command: () => this.openBalanceAction(customer, 'advance'),
      },
    ];
  }

  private openCustomerPayment(customer: CustomerDebtList, mode: 'all' | 'partial'): void {
    this.selectedCustomer.set(customer);
    this.service
      .loadCustomerDebt(customer.customerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (mode === 'all') this.onCustomerDebtPayAll();
        else this.onCustomerDebtPayPartial();
      });
  }

  private openBalanceAction(customer: CustomerDebtList, action: 'refund' | 'advance'): void {
    this.selectedCustomer.set(customer);
    this.customerDebtVisible.set(false);
    this.debtDialog().openBalanceAction(action, customer.customerId);
  }

  onViewCustomerDebt(customer: CustomerDebtList): void {
    this.selectedCustomer.set(customer);
    this.customerDebtVisible.set(true);
  }

  onCloseCustomerDebtDialog(): void {
    this.customerDebtVisible.set(false);
    this.selectedCustomer.set(null);
    this.service.clearCurrentCustomer();
  }

  onCustomerDebtPayInvoice(invoice: CustomerInvoiceDebt): void {
    this.paymentInvoice.set(invoice);
    this.paymentFormMode.set('single');
    this.paymentCustomerName.set(this.selectedCustomer()?.customerName ?? '');
    this.paymentTotalDebt.set(invoice.balance);
    this.paymentFormVisible.set(true);
  }

  onCustomerDebtPayAll(): void {
    const customer = this.selectedCustomer();
    if (!customer) return;
    const summary = this.service.currentCustomer();
    this.paymentFormMode.set('all');
    this.paymentCustomerName.set(customer.customerName);
    this.paymentTotalDebt.set(summary?.totalDebt ?? 0);
    this.paymentFormVisible.set(true);
  }

  onCustomerDebtPayPartial(): void {
    const customer = this.selectedCustomer();
    if (!customer) return;
    const summary = this.service.currentCustomer();
    this.paymentFormMode.set('partial');
    this.paymentCustomerName.set(customer.customerName);
    this.paymentTotalDebt.set(summary?.totalDebt ?? 0);
    this.paymentFormVisible.set(true);
  }

  onClosePaymentFormDialog(): void {
    this.paymentFormVisible.set(false);
    this.paymentInvoice.set(null);
    this.paymentCustomerName.set('');
    this.paymentTotalDebt.set(0);
  }

  onSubmitPayment(event: PaymentSubmitEvent): void {
    const customer = this.selectedCustomer();
    if (!customer) return;

    this.paymentSubmitting.set(true);

    if (this.paymentFormMode() === 'single' && this.paymentInvoice()) {
      this.service
        .payInvoice(this.paymentInvoice()!.invoiceId, event.request)
        .pipe(
          finalize(() => this.paymentSubmitting.set(false)),
          takeUntil(this.destroy$),
        )
        .subscribe({
          next: () => {
            this.onClosePaymentFormDialog();
            this.service.customerDebtChange.next();
            this.debtDialog().refreshVisibleDetails();
            this.loadCustomers();
          },
        });
    } else if (this.paymentFormMode() === 'all') {
      this.service
        .payAllCustomerDebt(customer.customerId, event.request)
        .pipe(
          finalize(() => this.paymentSubmitting.set(false)),
          takeUntil(this.destroy$),
        )
        .subscribe({
          next: () => {
            this.onClosePaymentFormDialog();
            this.service.customerDebtChange.next();
            this.debtDialog().refreshVisibleDetails();
            this.loadCustomers();
          },
        });
    } else if (this.paymentFormMode() === 'partial') {
      this.service
        .payPartialDebt(customer.customerId, event.request as PayPartialDebtRequest)
        .pipe(
          finalize(() => this.paymentSubmitting.set(false)),
          takeUntil(this.destroy$),
        )
        .subscribe({
          next: () => {
            this.onClosePaymentFormDialog();
            this.service.customerDebtChange.next();
            this.debtDialog().refreshVisibleDetails();
            this.loadCustomers();
          },
        });
    }
  }

  onViewInvoicePaymentHistory(invoice: CustomerInvoiceDebt): void {
    const customer = this.selectedCustomer();
    this.paymentHistoryCustomerId.set(customer?.customerId ?? '');
    this.paymentHistoryInvoiceId.set(invoice.invoiceId);
    this.paymentHistoryVisible.set(true);
  }

  onClosePaymentHistoryDialog(): void {
    this.paymentHistoryVisible.set(false);
    this.paymentHistoryCustomerId.set('');
    this.paymentHistoryInvoiceId.set(null);
  }

  onViewInvoicePdf(invoice: CustomerInvoiceDebt): void {
    const config: PdfViewerConfig = {
      url: `/api/reports/invoices/${invoice.invoiceId}/pdf`,
      title: `Factura #${invoice.invoiceNumber}`,
      fileName: `factura-${invoice.invoiceNumber}.pdf`,
    };
    this.pdfViewerService.open(config);
  }

  private loadCustomers(): void {
    const params: ReceivablesSearchParams = {
      page: Math.floor(this.first() / this.rows()),
      size: this.rows(),
      action: this.navigationAction(),
    };
    if (this.searchTerm()) {
      params.search = this.searchTerm();
    }
    if (this.sortField() && this.sortOrder() !== 0) {
      params.sort = `${this.sortField()},${this.sortOrder() === 1 ? 'asc' : 'desc'}`;
    }
    this.service.searchCustomersWithDebt(params).pipe(takeUntil(this.destroy$)).subscribe();
  }
}
