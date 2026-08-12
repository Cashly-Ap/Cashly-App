import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CatalogPdfFilters } from '@features/reports/inventory/models/interfaces/catalog-pdf-filters.interface';

@Injectable({ providedIn: 'root' })
export class CatalogPdfApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/reports/inventory/catalog/pdf';

  downloadPdf(filters: CatalogPdfFilters): Observable<Blob> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters.warehouseId) params = params.set('warehouseId', filters.warehouseId);
    if (filters.withStock !== undefined)
      params = params.set('withStock', String(filters.withStock));
    return this.http.get(this.baseUrl, { params, responseType: 'blob' });
  }
}
