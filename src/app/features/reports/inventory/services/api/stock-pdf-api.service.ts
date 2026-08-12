import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StockPdfFilters } from '@features/reports/inventory/models/interfaces';

@Injectable({ providedIn: 'root' })
export class StockPdfApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/reports/inventory/stock/pdf';

  getPdf(filters: StockPdfFilters): Observable<Blob> {
    let params = new HttpParams();
    if (filters.warehouseId) params = params.set('warehouseId', filters.warehouseId);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters.withStock !== undefined)
      params = params.set('withStock', String(filters.withStock));
    if (filters.lowStock !== undefined) params = params.set('lowStock', String(filters.lowStock));
    return this.http.get(this.baseUrl, { params, responseType: 'blob' });
  }
}
