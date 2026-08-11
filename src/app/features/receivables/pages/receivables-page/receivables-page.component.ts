import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, finalize } from 'rxjs';
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
import { ReceivablesApplicationService } from '@app/features/receivables/services/application/receivables-application.service';
import { ReceivablesSearchParams } from '@features/receivables/services/api/receivables-api.service';
import { CustomerDebtList, CustomerInvoiceDebt } from '@features/receivables/models/interfaces';
import {
  CustomerDebtDialogComponent,
  PaymentFormDialogComponent,
  PaymentHistoryDialogComponent,
} from '@features/receivables/components';
import { PendingPaymentsTabComponent } from '@features/receivables/components/pending-payments-tab/pending-payments-tab.component';
import { PaymentSubmitEvent } from '@features/receivables/components/payment-form-dialog/payment-form-dialog.component';
import { PayPartialDebtRequest } from '@features/receivables/models/interfaces';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-receivables-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
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
  ],
  templateUrl: './receivables-page.component.html',
})
export class ReceivablesPageComponent implements OnInit, OnDestroy {
  readonly service = inject(ReceivablesApplicationService);
  private readonly pdfViewerService = inject(PdfViewerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

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
    () =>
      !this.service.loading() &&
      this.service.totalCustomers() === 0 &&
      !this.searchTerm(),
  );

  readonly hasFilteredResults = computed(
    () =>
      !this.service.loading() &&
      this.service.totalCustomers() === 0 &&
      !!this.searchTerm(),
  );

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const requestedTab = params.get('tab');
        const focusPaymentId = params.get('focus');
        if (requestedTab === 'pending' || focusPaymentId) {
          this.activeTab.set('pending');
        }
        this.focusPaymentId.set(focusPaymentId);
      });

    this.service.loadGlobalSummary().pipe(takeUntil(this.destroy$)).subscribe();
    this.loadCustomers();

    this.service.customerDebtChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.service.loadGlobalSummary().pipe(takeUntil(this.destroy$)).subscribe();
        this.loadCustomers();
      });

    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.searchTerm.set(term);
        this.first.set(0);
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(value: string): void {
    this.searchSubject.next(value);
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
    this.customerDebtVisible.set(false);
    this.paymentFormVisible.set(true);
  }

  onCustomerDebtPayAll(): void {
    const customer = this.selectedCustomer();
    if (!customer) return;
    const summary = this.service.currentCustomer();
    this.paymentFormMode.set('all');
    this.paymentCustomerName.set(customer.customerName);
    this.paymentTotalDebt.set(summary?.totalDebt ?? 0);
    this.customerDebtVisible.set(false);
    this.paymentFormVisible.set(true);
  }

  onCustomerDebtPayPartial(): void {
    const customer = this.selectedCustomer();
    if (!customer) return;
    const summary = this.service.currentCustomer();
    this.paymentFormMode.set('partial');
    this.paymentCustomerName.set(customer.customerName);
    this.paymentTotalDebt.set(summary?.totalDebt ?? 0);
    this.customerDebtVisible.set(false);
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
            this.onViewCustomerDebt(customer);
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
    };
    if (this.searchTerm()) {
      params.search = this.searchTerm();
    }
    if (this.sortField() && this.sortOrder() !== 0) {
      params.sort = `${this.sortField()},${this.sortOrder() === 1 ? 'asc' : 'desc'}`;
    }
    this.service.searchCustomersWithDebt(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }
}
