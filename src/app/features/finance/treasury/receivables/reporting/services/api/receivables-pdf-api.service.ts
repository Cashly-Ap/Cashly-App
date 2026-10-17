import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  AccountsReceivableFilters,
  CollectionsFilters,
} from '@features/finance/treasury/receivables/reporting/models/interfaces';

@Injectable({
  providedIn: 'root',
})
export class ReceivablesPdfApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reports/finance`;

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
