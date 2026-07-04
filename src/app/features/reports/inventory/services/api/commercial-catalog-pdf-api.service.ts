import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommercialCatalogPdfFilters } from '@features/reports/inventory/models/interfaces';

@Injectable({ providedIn: 'root' })
export class CommercialCatalogPdfApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/reports/inventory/commercial-catalog/pdf';

  downloadPdf(filters: CommercialCatalogPdfFilters): Observable<Blob> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters.priceTypeId) params = params.set('priceTypeId', filters.priceTypeId);
    if (filters.active !== undefined) params = params.set('active', String(filters.active));
    return this.http.get(this.baseUrl, { params, responseType: 'blob' });
  }
}
