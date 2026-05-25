import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';
import {
  GlobalDebtSummary,
  CustomerDebtList,
  CustomerDebtSummary,
  CustomerInvoiceDebt,
  PendingPayment,
  PaymentResult,
  BulkPaymentResult,
  PayInvoiceRequest,
  PayCustomerDebtRequest,
  PayPartialDebtRequest,
} from '../../models/interfaces';

export interface ReceivablesSearchParams {
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
  status?: string;
  invoiceId?: string;
}

@Injectable({ providedIn: 'root' })
export class ReceivablesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/finances/receivables`;

  getGlobalSummary(): Observable<GlobalDebtSummary> {
    return this.http.get<GlobalDebtSummary>(`${this.baseUrl}/summary`);
  }

  searchCustomersWithDebt(params?: ReceivablesSearchParams): Observable<PagedResponse<CustomerDebtList>> {
    const httpParams = this.buildParams(params);
    return this.http.get<PagedResponse<CustomerDebtList>>(`${this.baseUrl}/customers`, { params: httpParams });
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

  payInvoice(
    invoiceId: string,
    request: PayInvoiceRequest,
    voucherFile?: File,
  ): Observable<PaymentResult> {
    const formData = this.buildFormData(request, voucherFile);
    return this.http.post<PaymentResult>(`${this.baseUrl}/invoices/${invoiceId}/pay`, formData);
  }

  payAllCustomerDebt(
    customerId: string,
    request: PayCustomerDebtRequest,
    voucherFile?: File,
  ): Observable<BulkPaymentResult> {
    const formData = this.buildFormData(request, voucherFile);
    return this.http.post<BulkPaymentResult>(
      `${this.baseUrl}/customers/${customerId}/pay-all`,
      formData,
    );
  }

  payPartialDebt(
    customerId: string,
    request: PayPartialDebtRequest,
    voucherFile?: File,
  ): Observable<BulkPaymentResult> {
    const formData = this.buildFormData(request, voucherFile);
    return this.http.post<BulkPaymentResult>(
      `${this.baseUrl}/customers/${customerId}/pay-partial`,
      formData,
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

  getMerchantPayments(params?: ReceivablesSearchParams): Observable<PagedResponse<PendingPayment>> {
    const httpParams = this.buildParams(params);
    return this.http.get<PagedResponse<PendingPayment>>(`${this.baseUrl}/payments/merchant`, {
      params: httpParams,
    });
  }

  approvePayment(
    paymentId: string,
    commissionPercentage?: number,
  ): Observable<PaymentResult> {
    return this.http.post<PaymentResult>(`${this.baseUrl}/payments/${paymentId}/approve`, {
      commissionPercentage,
    });
  }

  rejectPayment(paymentId: string, reason: string): Observable<PaymentResult> {
    return this.http.post<PaymentResult>(`${this.baseUrl}/payments/${paymentId}/reject`, { reason });
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

  getPaymentProofImage(imageUrl: string): Observable<Blob> {
    return this.http.get(imageUrl, { responseType: 'blob' });
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

  private buildFormData(request: object, voucherFile?: File): FormData {
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    if (voucherFile) {
      formData.append('voucherFile', voucherFile, voucherFile.name);
    }
    return formData;
  }
}
