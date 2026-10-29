import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { environment } from '@env/environment';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';
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
import { CreditStatusResponse } from '@features/finance/treasury/receivables/models/interfaces/credit-status.interface';

export interface ReceivablesSearchParams {
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
  status?: string;
  invoiceId?: string;
  action?: 'PAY_ALL' | 'PAY_PARTIAL' | 'REFUND';
}

@Injectable({ providedIn: 'root' })
export class ReceivablesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/receivables`;

  getGlobalSummary(): Observable<GlobalDebtSummary> {
    return this.http.get<GlobalDebtSummary>(`${this.baseUrl}/summary`);
  }

  searchCustomersWithDebt(
    params?: ReceivablesSearchParams,
  ): Observable<PagedResponse<CustomerDebtList>> {
    let httpParams = this.buildParams(params);
    if (params?.action) httpParams = httpParams.set('action', params.action);
    return this.http.get<PagedResponse<CustomerDebtList>>(`${this.baseUrl}/customers`, {
      params: httpParams,
    });
  }

  getCustomerDebt(customerId: string): Observable<CustomerDebtSummary> {
    return this.http.get<CustomerDebtSummary>(`${this.baseUrl}/customers/${customerId}`);
  }

  getCustomerInvoices(
    customerId: string,
    params?: ReceivablesSearchParams,
  ): Observable<PagedResponse<CustomerInvoiceDebt>> {
    const httpParams = this.buildParams(params);
    return this.http.get<PagedResponse<CustomerInvoiceDebt>>(
      `${this.baseUrl}/customers/${customerId}/invoices`,
      { params: httpParams },
    );
  }

  private readonly paymentsBaseUrl = `${environment.apiUrl}/payments`;

  payInvoice(invoiceId: string, request: PayInvoiceRequest): Observable<PaymentResult> {
    return this.http.post<PaymentResult>(
      `${this.paymentsBaseUrl}/invoices/${invoiceId}/pay`,
      request,
    );
  }

  payAllCustomerDebt(
    customerId: string,
    request: PayCustomerDebtRequest,
  ): Observable<BulkPaymentResult> {
    return this.http.post<BulkPaymentResult>(
      `${this.paymentsBaseUrl}/customers/${customerId}/pay-all`,
      request,
    );
  }

  payPartialDebt(
    customerId: string,
    request: PayPartialDebtRequest,
  ): Observable<BulkPaymentResult> {
    return this.http.post<BulkPaymentResult>(
      `${this.paymentsBaseUrl}/customers/${customerId}/pay-partial`,
      request,
    );
  }

  getPendingPayments(params?: ReceivablesSearchParams): Observable<PagedResponse<PendingPayment>> {
    const httpParams = this.buildParams(params);
    return this.http.get<PagedResponse<PendingPayment>>(`${this.baseUrl}/payments/pending`, {
      params: httpParams,
    });
  }

  getPaymentHistory(params?: ReceivablesSearchParams): Observable<PagedResponse<PendingPayment>> {
    const httpParams = this.buildParams(params);
    return this.http.get<PagedResponse<PendingPayment>>(`${this.baseUrl}/payments/history`, {
      params: httpParams,
    });
  }

  listPendingPayments(action?: 'APPROVE' | 'REJECT'): Observable<PendingPayment[]> {
    return forkJoin({
      payments: this.http.get<PendingPayment[]>(
        `${this.paymentsBaseUrl}?status=PENDING`,
        action ? { params: { action } } : {},
      ),
      details: this.getPaymentHistory({ page: 0, size: 100 }).pipe(
        map((response) => response.content ?? []),
        catchError(() => of([])),
      ),
    }).pipe(
      map(({ payments, details }) => {
        const detailsById = new Map(details.map((payment) => [payment.id, payment]));
        return payments.map((payment) => {
          const detail = detailsById.get(payment.id);
          return detail
            ? {
                ...payment,
                ...detail,
                referenceNumber: payment.referenceNumber,
                notes: payment.notes,
                voucherUrl: payment.voucherUrl,
              }
            : payment;
        });
      }),
    );
  }

  approvePayment(id: string, reason: string): Observable<any> {
    return this.http.post(`${this.paymentsBaseUrl}/${id}/approve`, { reason });
  }

  rejectPayment(id: string, reason: string): Observable<any> {
    return this.http.post(`${this.paymentsBaseUrl}/${id}/reject`, { reason });
  }

  getCustomerPaymentHistory(
    customerId: string,
    params?: ReceivablesSearchParams,
  ): Observable<PagedResponse<PendingPayment>> {
    const httpParams = this.buildParams(params);
    return this.http.get<PagedResponse<PendingPayment>>(
      `${this.baseUrl}/customers/${customerId}/payment-history`,
      { params: httpParams },
    );
  }

  getInvoicePaymentHistory(invoiceId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/invoices/${invoiceId}/payment-history`);
  }

  getCreditStatus(customerId: string): Observable<CreditStatusResponse> {
    return this.http.get<CreditStatusResponse>(
      `${environment.apiUrl}/customers/${customerId}/credit`,
    );
  }

  private buildParams(params?: ReceivablesSearchParams): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.invoiceId) httpParams = httpParams.set('invoiceId', params.invoiceId);
    return httpParams;
  }
}
