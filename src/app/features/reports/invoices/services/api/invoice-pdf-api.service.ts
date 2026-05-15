import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { InvoicesPdfFilters } from '../../models/interfaces';

export type { InvoicesPdfFilters };

@Injectable({
  providedIn: 'root',
})
export class InvoicePdfApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reports/invoices`;

  downloadInvoicePdf(invoiceId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${invoiceId}/pdf`, {
      responseType: 'blob',
    });
  }

  downloadInvoicesReportPdf(filters: InvoicesPdfFilters): Observable<Blob> {
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
