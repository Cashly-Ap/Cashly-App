import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  AccountsReceivableFilters,
  CollectionsFilters,
  PaymentHistoryFilters,
} from '@features/reports/finance/models/interfaces';

@Injectable({
  providedIn: 'root',
})
export class FinancePdfApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reports/finance`;

  getPaymentPdf(paymentId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/payments/${paymentId}/pdf`, {
      responseType: 'blob',
    });
  }

  getAccountsReceivablePdf(filters: AccountsReceivableFilters = {}): Observable<Blob> {
    let params = new HttpParams();

    if (filters.customerId) {
      params = params.set('customerId', filters.customerId);
    }
    if (filters.overdueOnly) {
      params = params.set('overdueOnly', String(filters.overdueOnly));
    }

    return this.http.get(`${this.baseUrl}/accounts-receivable/pdf`, {
      responseType: 'blob',
      params,
    });
  }

  getPaymentHistoryPdf(filters: PaymentHistoryFilters = {}): Observable<Blob> {
    let params = new HttpParams();

    if (filters.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom);
    }
    if (filters.dateTo) {
      params = params.set('dateTo', filters.dateTo);
    }
    if (filters.customerId) {
      params = params.set('customerId', filters.customerId);
    }
    if (filters.type) {
      params = params.set('type', filters.type);
    }
    if (filters.method) {
      params = params.set('method', filters.method);
    }

    return this.http.get(`${this.baseUrl}/payment-history/pdf`, {
      responseType: 'blob',
      params,
    });
  }

  getCollectionsPdf(filters: CollectionsFilters = {}): Observable<Blob> {
    let params = new HttpParams();

    if (filters.customerId) {
      params = params.set('customerId', filters.customerId);
    }
    if (filters.agingFrom) {
      params = params.set('agingFrom', filters.agingFrom);
    }

    return this.http.get(`${this.baseUrl}/collections/pdf`, {
      responseType: 'blob',
      params,
    });
  }
}
