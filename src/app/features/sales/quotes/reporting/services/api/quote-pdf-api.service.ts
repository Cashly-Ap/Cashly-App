import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface QuotesPdfFilters {
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  status?: string;
  productId?: string;
  categoryId?: string;
  mode?: 'SIMPLE' | 'DETAILED';
}

@Injectable({
  providedIn: 'root',
})
export class QuotePdfApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reports/quotes`;

  downloadQuotePdf(quoteId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${quoteId}/pdf`, {
      responseType: 'blob',
    });
  }

  downloadQuotesReportPdf(filters: QuotesPdfFilters): Observable<Blob> {
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
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.productId) {
      params = params.set('productId', filters.productId);
    }
    if (filters.categoryId) {
      params = params.set('categoryId', filters.categoryId);
    }
    if (filters.mode) {
      params = params.set('mode', filters.mode);
    }

    return this.http.get(`${this.baseUrl}/pdf`, {
      responseType: 'blob',
      params,
    });
  }
}
