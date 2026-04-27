import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CatalogItem, CatalogFilters } from '../../models/interfaces';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

@Injectable({ providedIn: 'root' })
export class CatalogApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/reports/inventory/catalog';

  getAll(filters?: CatalogFilters): Observable<PagedResponse<CatalogItem>> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.categoryId !== undefined) params = params.set('categoryId', String(filters.categoryId));
    if (filters?.warehouseId !== undefined) params = params.set('warehouseId', String(filters.warehouseId));
    if (filters?.composite !== undefined) params = params.set('composite', String(filters.composite));
    if (filters?.withStock !== undefined) params = params.set('withStock', String(filters.withStock));
    if (filters?.lowStock !== undefined) params = params.set('lowStock', String(filters.lowStock));
    if (filters?.page !== undefined) params = params.set('page', String(filters.page));
    if (filters?.size !== undefined) params = params.set('size', String(filters.size));
    return this.http.get<PagedResponse<CatalogItem>>(this.baseUrl, { params });
  }
}
