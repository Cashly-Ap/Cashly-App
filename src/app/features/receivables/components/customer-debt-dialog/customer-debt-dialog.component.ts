import { Component, input, output, inject, signal, computed, effect } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ReceivablesApplicationService } from '../../services/application/receivables-application.service';
import { CustomerInvoiceDebt } from '../../models/interfaces';

type InvoiceStatusFilter = 'ALL' | 'PENDING' | 'PARTIAL' | 'PAID';

interface StatusFilterOption {
  label: string;
  value: InvoiceStatusFilter;
}

@Component({
  selector: 'app-customer-debt-dialog',
  standalone: true,
  imports: [
    DialogModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    TagModule,
    TooltipModule,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './customer-debt-dialog.component.html',
})
export class CustomerDebtDialogComponent {
  protected service = inject(ReceivablesApplicationService);

  readonly visible = input.required<boolean>();
  readonly customerId = input.required<string>();

  readonly close = output<void>();
  readonly payInvoice = output<CustomerInvoiceDebt>();
  readonly payAll = output<void>();
  readonly payPartial = output<void>();
  readonly viewInvoicePaymentHistory = output<CustomerInvoiceDebt>();
  readonly viewInvoicePdf = output<CustomerInvoiceDebt>();
  readonly approveInvoice = output<CustomerInvoiceDebt>();
  readonly rejectInvoice = output<CustomerInvoiceDebt>();

  protected customer = computed(() => this.service.currentCustomer());
  protected invoices = computed(() => this.service.customerInvoices());
  protected loading = computed(() => this.service.loading());

  protected initialLoadComplete = signal(false);
  protected loadingInvoices = signal(false);
  protected selectedStatusFilter = signal<InvoiceStatusFilter>('ALL');

  protected invoiceFirst = signal(0);
  protected invoiceRows = signal(10);
  protected invoiceTotalRecords = signal(0);

  protected allInvoicesFullyBlocked = computed(() =>
    this.invoices().length > 0 &&
    this.invoices().every((inv) => this.isInvoiceFullyBlocked(inv)),
  );

  protected readonly statusFilterOptions: StatusFilterOption[] = [
    { label: 'Todos', value: 'ALL' },
    { label: 'Pendientes', value: 'PENDING' },
    { label: 'Parcial', value: 'PARTIAL' },
    { label: 'Pagados', value: 'PAID' },
  ];

  constructor() {
    effect(() => {
      const isVisible = this.visible();
      const id = this.customerId();
      if (isVisible && id) {
        this.loadCustomerData(id);
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

  protected onApproveInvoice(invoice: CustomerInvoiceDebt): void {
    this.approveInvoice.emit(invoice);
  }

  protected onRejectInvoice(invoice: CustomerInvoiceDebt): void {
    this.rejectInvoice.emit(invoice);
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
    switch (status) {
      case 'PENDING':
      case 'PENDING_PAYMENT':
        return 'Pendiente';
      case 'DELIVERED':
        return 'Entregada';
      case 'PARTIAL':
        return 'Parcial';
      case 'PAID':
        return 'Pagado';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status;
    }
  }

  protected getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'contrast' {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PARTIAL':
        return 'warn';
      case 'DELIVERED':
        return 'info';
      case 'PENDING':
      case 'PENDING_PAYMENT':
        return 'warn';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'info';
    }
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

    const params: Record<string, unknown> = {
      page: Math.floor(first / rows),
      size: rows,
    };
    if (status !== 'ALL') {
      params['status'] = status;
    }

    this.service.loadCustomerInvoices(customerId, params as any).subscribe({
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
}
