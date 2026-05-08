import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface OrdersPdfFilters {
  customerId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  createdBy?: string;
  mode?: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderPdfApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reports/orders`;

  /**
   * Download PDF for a single order by ID
   */
  downloadOrderPdf(orderId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${orderId}/pdf`, {
      responseType: 'blob',
    });
  }

  /**
   * Download PDF report for multiple orders
   */
  downloadOrdersReportPdf(filters: OrdersPdfFilters): Observable<Blob> {
    let params = new HttpParams();

    if (filters.customerId) {
      params = params.set('customerId', filters.customerId);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.fromDate) {
      params = params.set('fromDate', filters.fromDate);
    }
    if (filters.toDate) {
      params = params.set('toDate', filters.toDate);
    }
    if (filters.createdBy) {
      params = params.set('createdBy', filters.createdBy);
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