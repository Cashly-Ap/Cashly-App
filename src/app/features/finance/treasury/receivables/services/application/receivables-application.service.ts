import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, Subject, tap, catchError, finalize, of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AuthService } from '@features/platform/auth/services/application/auth-application.service';
import {
  ReceivablesApiService,
  ReceivablesSearchParams,
} from '@features/finance/treasury/receivables/services/api/receivables-api.service';
import { RECEIVABLES_ERROR_MESSAGES } from '@features/finance/treasury/receivables/messages/error-messages';
import { GlobalDebtSummary } from '@features/finance/treasury/receivables/models/interfaces/global-debt-summary.interface';
import { CustomerDebtList } from '@features/finance/treasury/receivables/models/interfaces/customer-debt-list.interface';
import { CustomerDebtSummary } from '@features/finance/treasury/receivables/models/interfaces/customer-debt-summary.interface';
import { CustomerInvoiceDebt } from '@features/finance/treasury/receivables/models/interfaces/customer-invoice-debt.interface';
import { PendingPayment } from '@features/finance/treasury/receivables/models/interfaces/pending-payment.interface';
import {
  PaymentResult,
  BulkPaymentResult,
} from '@features/finance/treasury/receivables/models/interfaces/payment-result.interface';
import {
  PayInvoiceRequest,
  PayCustomerDebtRequest,
  PayPartialDebtRequest,
} from '@features/finance/treasury/receivables/models/interfaces/payment-request.interface';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

@Injectable({ providedIn: 'root' })
export class ReceivablesApplicationService {
  private readonly api = inject(ReceivablesApiService);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);

  readonly globalSummary = signal<GlobalDebtSummary | null>(null);
  readonly customers = signal<CustomerDebtList[]>([]);
  readonly currentCustomer = signal<CustomerDebtSummary | null>(null);
  readonly customerInvoices = signal<CustomerInvoiceDebt[]>([]);
  readonly pendingPayments = signal<PendingPayment[]>([]);
  readonly rejectedPayments = signal<PendingPayment[]>([]);
  readonly merchantPayments = signal<PendingPayment[]>([]);
  readonly allPayments = signal<PendingPayment[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly totalCustomers = signal(0);
  readonly totalPendingPayments = signal(0);
  readonly totalPaymentHistory = signal(0);
  readonly totalMerchantPayments = signal(0);
  readonly totalAllPayments = signal(0);
  readonly totalCustomerInvoices = signal(0);

  readonly customerDebtChange = new Subject<void>();
  readonly pendingPaymentsChange = new Subject<void>();

  readonly isAdmin = computed(() =>
    this.authService.hasPermission(BusinessModule.FINANCE, 'EXECUTE'),
  );
  readonly isMerchant = computed(() => !this.isAdmin());

  loadGlobalSummary(): Observable<GlobalDebtSummary | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getGlobalSummary().pipe(
      tap({
        next: (summary) => this.globalSummary.set(summary),
        error: () => {
          this.error.set(RECEIVABLES_ERROR_MESSAGES.LOAD_GLOBAL_SUMMARY_FAILED);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: RECEIVABLES_ERROR_MESSAGES.LOAD_GLOBAL_SUMMARY_FAILED,
            life: 5000,
          });
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  searchCustomersWithDebt(
    params?: ReceivablesSearchParams,
  ): Observable<PagedResponse<CustomerDebtList> | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.searchCustomersWithDebt(params).pipe(
      tap({
        next: (res) => {
          this.customers.set(res.content ?? []);
          this.totalCustomers.set(res.totalElements ?? 0);
        },
        error: () => {
          this.error.set(RECEIVABLES_ERROR_MESSAGES.SEARCH_CUSTOMERS_FAILED);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: RECEIVABLES_ERROR_MESSAGES.SEARCH_CUSTOMERS_FAILED,
            life: 5000,
          });
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  loadCustomerDebt(customerId: string): Observable<CustomerDebtSummary | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getCustomerDebt(customerId).pipe(
      tap({
        next: (summary) => this.currentCustomer.set(summary),
        error: () => {
          this.error.set(RECEIVABLES_ERROR_MESSAGES.LOAD_CUSTOMER_DEBT_FAILED);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: RECEIVABLES_ERROR_MESSAGES.LOAD_CUSTOMER_DEBT_FAILED,
            life: 5000,
          });
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  loadCustomerInvoices(
    customerId: string,
    params?: ReceivablesSearchParams,
  ): Observable<PagedResponse<CustomerInvoiceDebt> | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getCustomerInvoices(customerId, params).pipe(
      tap({
        next: (res) => {
          this.customerInvoices.set(res.content ?? []);
          this.totalCustomerInvoices.set(res.totalElements ?? 0);
        },
        error: () => {
          this.error.set(RECEIVABLES_ERROR_MESSAGES.LOAD_CUSTOMER_INVOICES_FAILED);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: RECEIVABLES_ERROR_MESSAGES.LOAD_CUSTOMER_INVOICES_FAILED,
            life: 5000,
          });
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  payInvoice(invoiceId: string, request: PayInvoiceRequest): Observable<PaymentResult | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.payInvoice(invoiceId, request).pipe(
      tap({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Factura pagada exitosamente',
            life: 3000,
          });
        },
        error: () => {
          this.error.set(RECEIVABLES_ERROR_MESSAGES.PAY_INVOICE_FAILED);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: RECEIVABLES_ERROR_MESSAGES.PAY_INVOICE_FAILED,
            life: 5000,
          });
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  payAllCustomerDebt(
    customerId: string,
    request: PayCustomerDebtRequest,
  ): Observable<BulkPaymentResult | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.payAllCustomerDebt(customerId, request).pipe(
      tap({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Deuda total pagada exitosamente',
            life: 3000,
          });
        },
        error: () => {
          this.error.set(RECEIVABLES_ERROR_MESSAGES.PAY_ALL_DEBT_FAILED);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: RECEIVABLES_ERROR_MESSAGES.PAY_ALL_DEBT_FAILED,
            life: 5000,
          });
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  payPartialDebt(
    customerId: string,
    request: PayPartialDebtRequest,
  ): Observable<BulkPaymentResult | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.payPartialDebt(customerId, request).pipe(
      tap({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Pago parcial procesado exitosamente',
            life: 3000,
          });
        },
        error: () => {
          this.error.set(RECEIVABLES_ERROR_MESSAGES.PAY_PARTIAL_DEBT_FAILED);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: RECEIVABLES_ERROR_MESSAGES.PAY_PARTIAL_DEBT_FAILED,
            life: 5000,
          });
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  loadPendingPayments(
    params?: ReceivablesSearchParams,
  ): Observable<PagedResponse<PendingPayment> | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getPendingPayments(params).pipe(
      tap({
        next: (res) => {
          this.pendingPayments.set(res.content ?? []);
          this.totalPendingPayments.set(res.totalElements ?? 0);
        },
        error: () => {
          this.error.set(RECEIVABLES_ERROR_MESSAGES.LOAD_PENDING_PAYMENTS_FAILED);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: RECEIVABLES_ERROR_MESSAGES.LOAD_PENDING_PAYMENTS_FAILED,
            life: 5000,
          });
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  loadRejectedPayments(
    params?: ReceivablesSearchParams,
  ): Observable<PagedResponse<PendingPayment> | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getPaymentHistory(params).pipe(
      tap({
        next: (res) => {
          this.rejectedPayments.set(res.content ?? []);
        },
        error: () => {
          this.error.set(RECEIVABLES_ERROR_MESSAGES.LOAD_PAYMENT_HISTORY_FAILED);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: RECEIVABLES_ERROR_MESSAGES.LOAD_PAYMENT_HISTORY_FAILED,
            life: 5000,
          });
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  loadMerchantPayments(
    params?: ReceivablesSearchParams,
  ): Observable<PagedResponse<PendingPayment> | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getPaymentHistory(params).pipe(
      tap({
        next: (res) => {
          this.merchantPayments.set(res.content ?? []);
          this.totalMerchantPayments.set(res.totalElements ?? 0);
        },
        error: () => {
          this.error.set(RECEIVABLES_ERROR_MESSAGES.LOAD_MERCHANT_PAYMENTS_FAILED);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: RECEIVABLES_ERROR_MESSAGES.LOAD_MERCHANT_PAYMENTS_FAILED,
            life: 5000,
          });
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  loadAllPayments(
    params?: ReceivablesSearchParams,
  ): Observable<PagedResponse<PendingPayment> | null> {
    this.loading.set(true);
    this.error.set(null);

    return this.api.getPaymentHistory(params).pipe(
      tap({
        next: (res) => {
          this.allPayments.set(res.content ?? []);
          this.totalAllPayments.set(res.totalElements ?? 0);
        },
        error: () => {
          this.error.set(RECEIVABLES_ERROR_MESSAGES.LOAD_ALL_PAYMENTS_FAILED);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: RECEIVABLES_ERROR_MESSAGES.LOAD_ALL_PAYMENTS_FAILED,
            life: 5000,
          });
        },
      }),
      catchError(() => of(null)),
      finalize(() => this.loading.set(false)),
    );
  }

  clearCurrentCustomer(): void {
    this.currentCustomer.set(null);
    this.customerInvoices.set([]);
    this.totalCustomerInvoices.set(0);
  }

  clearError(): void {
    this.error.set(null);
  }
}
