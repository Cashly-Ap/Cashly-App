import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DocumentListAction } from '@shared/models/document-list-action';
import { Observable } from 'rxjs';
import { CustomerList } from '@features/partners/customers/models/interfaces/customer-list.interface';
import { CustomerDetails } from '@features/partners/customers/models/interfaces/customer-details.interface';
import { CustomerCreate } from '@features/partners/customers/models/interfaces/customer-create.interface';
import { CustomerEdit } from '@features/partners/customers/models/interfaces/customer-edit.interface';
import { CustomerWarehouseAccessItem } from '@features/partners/customers/models/interfaces/customer-warehouse-access.interface';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

export interface CustomerFilters {
  action?: DocumentListAction;
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

export interface CustomerPickerFilters {
  search?: string;
  type?: string;
  page?: number;
  size?: number;
}

export interface CustomerCreatedResponse {
  id: string;
}

@Injectable({ providedIn: 'root' })
export class CustomerApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/customers';

  getAll(filters?: CustomerFilters): Observable<PagedResponse<CustomerList>> {
    let params = new HttpParams();
    if (filters?.action) params = params.set('action', filters.action);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.type) params = params.set('type', filters.type);
    if (filters?.active !== undefined) params = params.set('active', String(filters.active));
    if (filters?.state) params = params.set('state', filters.state);
    if (filters?.municipality) params = params.set('municipality', filters.municipality);
    if (filters?.page !== undefined) params = params.set('page', String(filters.page));
    if (filters?.size !== undefined) params = params.set('size', String(filters.size));
    if (filters?.orderBy) params = params.set('orderBy', filters.orderBy);
    if (filters?.orderDir) params = params.set('orderDir', filters.orderDir);
    return this.http.get<PagedResponse<CustomerList>>(this.baseUrl, { params });
  }

  getForPicker(filters?: CustomerPickerFilters): Observable<PagedResponse<CustomerList>> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.type) params = params.set('type', filters.type);
    if (filters?.page !== undefined) params = params.set('page', String(filters.page));
    if (filters?.size !== undefined) params = params.set('size', String(filters.size));
    return this.http.get<PagedResponse<CustomerList>>(`${this.baseUrl}/picker`, { params });
  }

  getById(id: string): Observable<CustomerDetails> {
    return this.http.get<CustomerDetails>(`${this.baseUrl}/${id}`);
  }

  create(data: CustomerCreate): Observable<CustomerCreatedResponse> {
    return this.http.post<CustomerCreatedResponse>(this.baseUrl, data);
  }

  update(id: string, data: CustomerEdit): Observable<CustomerDetails> {
    return this.http.put<CustomerDetails>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getWarehouseAccess(id: string): Observable<CustomerWarehouseAccessItem[]> {
    return this.http.get<CustomerWarehouseAccessItem[]>(`${this.baseUrl}/${id}/warehouses`);
  }

  grantWarehouseAccess(id: string, warehouseId: string): Observable<CustomerWarehouseAccessItem> {
    return this.http.post<CustomerWarehouseAccessItem>(
      `${this.baseUrl}/${id}/warehouses/${warehouseId}`,
      {},
    );
  }

  revokeWarehouseAccess(id: string, warehouseId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/warehouses/${warehouseId}`);
  }
}
