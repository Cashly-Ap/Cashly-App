import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SupplierList,
  SupplierDetails,
  SupplierCreate,
  SupplierEdit,
} from '@features/suppliers/models/interfaces';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

export interface SupplierFilters {
  search?: string;
  type?: string;
  active?: boolean;
  state?: string;
  municipality?: string;
  page?: number;
  size?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

export interface SupplierCreatedResponse {
  id: string;
}

@Injectable({ providedIn: 'root' })
export class SupplierApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/suppliers';

  getAll(filters?: SupplierFilters): Observable<PagedResponse<SupplierList>> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.type) params = params.set('type', filters.type);
    if (filters?.active !== undefined) params = params.set('active', String(filters.active));
    if (filters?.state) params = params.set('state', filters.state);
    if (filters?.municipality) params = params.set('municipality', filters.municipality);
    if (filters?.page !== undefined) params = params.set('page', String(filters.page));
    if (filters?.size !== undefined) params = params.set('size', String(filters.size));
    if (filters?.orderBy) params = params.set('orderBy', filters.orderBy);
    if (filters?.orderDir) params = params.set('orderDir', filters.orderDir);
    return this.http.get<PagedResponse<SupplierList>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<SupplierDetails> {
    return this.http.get<SupplierDetails>(`${this.baseUrl}/${id}`);
  }

  create(data: SupplierCreate): Observable<SupplierCreatedResponse> {
    return this.http.post<SupplierCreatedResponse>(this.baseUrl, data);
  }

  update(id: string, data: SupplierEdit): Observable<SupplierDetails> {
    return this.http.put<SupplierDetails>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
