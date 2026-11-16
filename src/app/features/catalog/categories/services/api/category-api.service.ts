import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DocumentListAction } from '@shared/models/document-list-action';
import { Observable } from 'rxjs';
import { CategoryList } from '@features/catalog/categories/models/interfaces/category-list.interface';
import { CategoryDetails } from '@features/catalog/categories/models/interfaces/category-details.interface';
import { CategoryCreate } from '@features/catalog/categories/models/interfaces/category-create.interface';
import { CategoryUpdate } from '@features/catalog/categories/models/interfaces/category-update.interface';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

export interface CategoryFilters {
  action?: DocumentListAction;
  search?: string;
  active?: boolean;
  page?: number;
  size?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

@Injectable({ providedIn: 'root' })
export class CategoryApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/categories';

  getAll(filters?: CategoryFilters): Observable<PagedResponse<CategoryList>> {
    let params = new HttpParams();
    if (filters?.action) params = params.set('action', filters.action);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.active !== undefined) params = params.set('active', String(filters.active));
    if (filters?.page !== undefined) params = params.set('page', String(filters.page));
    if (filters?.size !== undefined) params = params.set('size', String(filters.size));
    if (filters?.orderBy) params = params.set('orderBy', filters.orderBy);
    if (filters?.orderDir) params = params.set('orderDir', filters.orderDir);
    return this.http.get<PagedResponse<CategoryList>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<CategoryDetails> {
    return this.http.get<CategoryDetails>(`${this.baseUrl}/${id}`);
  }

  create(data: CategoryCreate): Observable<CategoryDetails> {
    return this.http.post<CategoryDetails>(this.baseUrl, data);
  }

  update(id: string, data: CategoryUpdate): Observable<CategoryDetails> {
    return this.http.put<CategoryDetails>(`${this.baseUrl}/${id}`, data);
  }

  toggleActive(id: string, active: boolean): Observable<CategoryDetails> {
    return this.http.patch<CategoryDetails>(`${this.baseUrl}/${id}/active`, { active });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
