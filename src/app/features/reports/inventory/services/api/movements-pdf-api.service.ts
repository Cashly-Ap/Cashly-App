import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MovementsPdfFilters } from '../../models/interfaces';

@Injectable({ providedIn: 'root' })
export class MovementsPdfApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/reports/inventory/movements/pdf';

  getPdf(filters: MovementsPdfFilters): Observable<Blob> {
    let params = new HttpParams();
    if (filters.warehouseId) params = params.set('warehouseId', filters.warehouseId);
    if (filters.productId) params = params.set('productId', filters.productId);
    if (filters.movementType) params = params.set('movementType', filters.movementType);
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    return this.http.get(this.baseUrl, { params, responseType: 'blob' });
  }
}
