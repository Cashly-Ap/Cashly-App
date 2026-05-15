import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ProductList, ProductDetails, ProductCreate, ProductUpdate, ProductStockByWarehouse } from '../../models/interfaces';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  composite?: boolean;
  active?: boolean;
  page?: number;
  size?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/products';

  getAll(filters?: ProductFilters): Observable<PagedResponse<ProductList>> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.categoryId !== undefined) params = params.set('categoryId', String(filters.categoryId));
    if (filters?.composite !== undefined) params = params.set('composite', String(filters.composite));
    if (filters?.active !== undefined) params = params.set('active', String(filters.active));
    if (filters?.page !== undefined) params = params.set('page', String(filters.page));
    if (filters?.size !== undefined) params = params.set('size', String(filters.size));
    if (filters?.orderBy) params = params.set('orderBy', filters.orderBy);
    if (filters?.orderDir) params = params.set('orderDir', filters.orderDir);
    return this.http.get<PagedResponse<ProductList>>(this.baseUrl, { params });
  }

  getAllSimple(): Observable<ProductList[]> {
    return this.getAll({ size: 1000, active: true }).pipe(map((res) => res.content ?? []));
  }

  getById(id: string): Observable<ProductDetails> {
    return this.http.get<ProductDetails>(`${this.baseUrl}/${id}`);
  }

  create(data: ProductCreate): Observable<ProductDetails> {
    return this.http.post<ProductDetails>(this.baseUrl, data);
  }

  update(id: string, data: ProductUpdate): Observable<ProductDetails> {
    return this.http.put<ProductDetails>(`${this.baseUrl}/${id}`, data);
  }

  toggleActive(id: string, active: boolean): Observable<ProductDetails> {
    return this.http.patch<ProductDetails>(`${this.baseUrl}/${id}/active`, { active });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getStock(id: string): Observable<ProductStockByWarehouse[]> {
    return this.http.get<ProductStockByWarehouse[]>(`${this.baseUrl}/${id}/stock`);
  }
}
