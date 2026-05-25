import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, finalize } from 'rxjs';
import { MainLayoutComponent } from '@core/layouts/main-layout.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { PdfViewerService, PdfViewerConfig } from '@core/pdf-viewer';
import { ReceivablesApplicationService } from '../../services/application/receivables-application.service';
import { ReceivablesSearchParams } from '../../services/api/receivables-api.service';
import { CustomerDebtList, CustomerInvoiceDebt } from '../../models/interfaces';
import {
  CustomerDebtDialogComponent,
  PaymentFormDialogComponent,
} from '../../components';
import { PaymentSubmitEvent } from '../../components/payment-form-dialog/payment-form-dialog.component';
import { PayPartialDebtRequest } from '../../models/interfaces';

@Component({
  selector: 'app-receivables-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    MainLayoutComponent,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    PaginatorModule,
    SkeletonModule,
    CustomerDebtDialogComponent,
    PaymentFormDialogComponent,
  ],
  templateUrl: './receivables-page.component.html',
})
export class ReceivablesPageComponent implements OnInit, OnDestroy {
  readonly service = inject(ReceivablesApplicationService);
  private readonly pdfViewerService = inject(PdfViewerService);

  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  readonly searchTerm = signal('');
  readonly first = signal(0);
  readonly rows = signal(10);

  readonly customerDebtVisible = signal(false);
  readonly selectedCustomer = signal<CustomerDebtList | null>(null);

  readonly paymentFormVisible = signal(false);
  readonly paymentFormMode = signal<'single' | 'all' | 'partial'>('single');
  readonly paymentInvoice = signal<CustomerInvoiceDebt | null>(null);
  readonly paymentCustomerName = signal('');
  readonly paymentTotalDebt = signal(0);
  readonly paymentSubmitting = signal(false);

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
    this.service.loadGlobalSummary().pipe(takeUntil(this.destroy$)).subscribe();
    this.loadCustomers();

    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.searchTerm.set(term);
        this.first.set(0);
        this.loadCustomers();
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
        .payInvoice(this.paymentInvoice()!.invoiceId, event.request, event.voucherFile)
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
        .payAllCustomerDebt(customer.customerId, event.request, event.voucherFile)
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
        .payPartialDebt(customer.customerId, event.request as PayPartialDebtRequest, event.voucherFile)
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
    this.service.searchCustomersWithDebt(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }
}
