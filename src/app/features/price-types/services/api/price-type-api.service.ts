import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PriceTypeList,
  PriceTypeDetails,
  PriceTypeCreate,
  PriceTypeUpdate,
} from '@features/price-types/models/interfaces';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

export interface PriceTypeFilters {
  search?: string;
  active?: boolean;
  page?: number;
  size?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

@Injectable({ providedIn: 'root' })
export class PriceTypeApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/price-types';

  getAll(filters?: PriceTypeFilters): Observable<PagedResponse<PriceTypeList>> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.active !== undefined) params = params.set('active', String(filters.active));
    if (filters?.page !== undefined) params = params.set('page', String(filters.page));
    if (filters?.size !== undefined) params = params.set('size', String(filters.size));
    if (filters?.orderBy) params = params.set('orderBy', filters.orderBy);
    if (filters?.orderDir) params = params.set('orderDir', filters.orderDir);
    return this.http.get<PagedResponse<PriceTypeList>>(this.baseUrl, { params });
  }

  findById(id: string): Observable<PriceTypeDetails> {
    return this.http.get<PriceTypeDetails>(`${this.baseUrl}/${id}`);
  }

  create(data: PriceTypeCreate): Observable<PriceTypeDetails> {
    return this.http.post<PriceTypeDetails>(this.baseUrl, data);
  }

  update(id: string, data: PriceTypeUpdate): Observable<PriceTypeDetails> {
    return this.http.put<PriceTypeDetails>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
