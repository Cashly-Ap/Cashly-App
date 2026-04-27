import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { WarehouseList, WarehouseDetails, WarehouseCreate, WarehouseUpdate, StockEntryRequest } from '../../models/interfaces';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

export interface WarehouseFilters {
  search?: string;
  state?: string;
  active?: boolean;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class WarehouseApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/warehouses';

  getAll(filters?: WarehouseFilters): Observable<PagedResponse<WarehouseList>> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.state) params = params.set('state', filters.state);
    if (filters?.active !== undefined) params = params.set('active', String(filters.active));
    if (filters?.page !== undefined) params = params.set('page', String(filters.page));
    if (filters?.size !== undefined) params = params.set('size', String(filters.size));
    return this.http.get<PagedResponse<WarehouseList>>(this.baseUrl, { params });
  }

  getAllSimple(): Observable<WarehouseList[]> {
    return this.getAll({ size: 1000, active: true }).pipe(map((res) => res.content ?? []));
  }

  getById(id: string): Observable<WarehouseDetails> {
    return this.http.get<WarehouseDetails>(`${this.baseUrl}/${id}`).pipe(
      map((w) => ({ ...w, stock: w.stock ?? [], recentMovements: w.recentMovements ?? [] }))
    );
  }

  create(data: WarehouseCreate): Observable<WarehouseDetails> {
    return this.http.post<WarehouseDetails>(this.baseUrl, data);
  }

  update(id: string, data: WarehouseUpdate): Observable<WarehouseDetails> {
    return this.http.put<WarehouseDetails>(`${this.baseUrl}/${id}`, data);
  }

  toggleActive(id: string, active: boolean): Observable<WarehouseDetails> {
    return this.http.patch<WarehouseDetails>(`${this.baseUrl}/${id}/active`, { active });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  addStock(id: string, data: StockEntryRequest): Observable<WarehouseDetails> {
    return this.http.post<WarehouseDetails>(`${this.baseUrl}/${id}/stock`, data);
  }
}
