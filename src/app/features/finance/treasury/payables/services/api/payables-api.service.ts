import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { environment } from '@env/environment';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';
import { GlobalPayableSummary } from '@features/finance/treasury/payables/models/interfaces/global-payable-summary.interface';
import { SupplierDebtList } from '@features/finance/treasury/payables/models/interfaces/supplier-debt-list.interface';
import { SupplierDebtSummary } from '@features/finance/treasury/payables/models/interfaces/supplier-debt-summary.interface';
import { SupplierPurchaseDebt } from '@features/finance/treasury/payables/models/interfaces/supplier-purchase-debt.interface';
import { SupplierPayment } from '@features/finance/treasury/payables/models/interfaces/supplier-payment.interface';
import { PaymentResult } from '@features/finance/treasury/payables/models/interfaces/payment-result.interface';
import {
  CreateSupplierPaymentRequest,
  CreatedSupplierPaymentResponse,
  PayPurchaseRequest,
  PaySupplierDebtRequest,
  PayPartialDebtRequest,
} from '@features/finance/treasury/payables/models/interfaces/payment-request.interface';

export interface PayablesSearchParams {
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
  status?: string;
  purchaseId?: string;
  action?: 'PAY_ALL' | 'PAY_PARTIAL' | 'REFUND';
}

@Injectable({ providedIn: 'root' })
export class PayablesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/payables`;
  private readonly paymentsBaseUrl = `${environment.apiUrl}/supplier-payments`;

  getGlobalSummary(): Observable<GlobalPayableSummary> {
    return this.http.get<GlobalPayableSummary>(`${this.baseUrl}/summary`);
  }

  searchSuppliersWithDebt(
    params?: PayablesSearchParams,
  ): Observable<PagedResponse<SupplierDebtList>> {
    let httpParams = this.buildParams(params);
    if (params?.action) httpParams = httpParams.set('action', params.action);
    return this.http.get<PagedResponse<SupplierDebtList>>(`${this.baseUrl}/suppliers`, {
      params: httpParams,
    });
  }

  getSupplierDebt(supplierId: string): Observable<SupplierDebtSummary> {
    return this.http.get<SupplierDebtSummary>(`${this.baseUrl}/suppliers/${supplierId}`);
  }

  getSupplierPurchases(
    supplierId: string,
    params?: PayablesSearchParams,
  ): Observable<PagedResponse<SupplierPurchaseDebt>> {
    const httpParams = this.buildParams(params);
    return this.http.get<PagedResponse<SupplierPurchaseDebt>>(
      `${this.baseUrl}/suppliers/${supplierId}/purchases`,
      { params: httpParams },
    );
  }

  getPaymentHistory(params?: PayablesSearchParams): Observable<PagedResponse<SupplierPayment>> {
    const httpParams = this.buildParams(params);
    return this.http.get<PagedResponse<SupplierPayment>>(`${this.baseUrl}/payments/history`, {
      params: httpParams,
    });
  }

  getSupplierPaymentHistory(
    supplierId: string,
    params?: PayablesSearchParams,
  ): Observable<PagedResponse<SupplierPayment>> {
    const httpParams = this.buildParams(params);
    return this.http.get<PagedResponse<SupplierPayment>>(
      `${this.baseUrl}/suppliers/${supplierId}/payment-history`,
      { params: httpParams },
    );
  }

  createPayment(request: CreateSupplierPaymentRequest): Observable<CreatedSupplierPaymentResponse> {
    return this.http.post<CreatedSupplierPaymentResponse>(this.paymentsBaseUrl, request);
  }

  payPurchase(purchaseId: string, request: PayPurchaseRequest): Observable<PaymentResult> {
    return this.http.post<PaymentResult>(
      `${this.paymentsBaseUrl}/purchases/${purchaseId}/pay`,
      request,
    );
  }

  payAllSupplierDebt(
    supplierId: string,
    request: PaySupplierDebtRequest,
  ): Observable<PaymentResult> {
    return this.http.post<PaymentResult>(
      `${this.paymentsBaseUrl}/suppliers/${supplierId}/pay-all`,
      request,
    );
  }

  payPartialDebt(supplierId: string, request: PayPartialDebtRequest): Observable<PaymentResult> {
    return this.http.post<PaymentResult>(
      `${this.paymentsBaseUrl}/suppliers/${supplierId}/pay-partial`,
      request,
    );
  }

  listPendingPayments(action?: 'APPROVE' | 'REJECT'): Observable<SupplierPayment[]> {
    return forkJoin({
      payments: this.http.get<SupplierPayment[]>(this.paymentsBaseUrl, {
        params: { status: 'PENDING', ...(action ? { action } : {}) },
      }),
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
                referenceNumber: payment.referenceNumber ?? detail.referenceNumber,
                notes: payment.notes ?? detail.notes,
              }
            : payment;
        });
      }),
    );
  }

  approvePayment(id: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.paymentsBaseUrl}/${id}/approve`, { reason });
  }

  rejectPayment(id: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.paymentsBaseUrl}/${id}/reject`, { reason });
  }

  private buildParams(params?: PayablesSearchParams): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.purchaseId) httpParams = httpParams.set('purchaseId', params.purchaseId);
    return httpParams;
  }
}
