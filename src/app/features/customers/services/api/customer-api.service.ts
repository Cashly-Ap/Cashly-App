import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerList, CustomerDetails, CustomerCreate, CustomerEdit } from '../../models/interfaces';

export interface CustomerFilters {
  search?: string;
  type?: string;
  active?: boolean;
  portalAccess?: boolean;
  state?: string;
  municipality?: string;
}

@Injectable({ providedIn: 'root' })
export class CustomerApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/customers';

  getAll(filters?: CustomerFilters): Observable<CustomerList[]> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.type) params = params.set('type', filters.type);
    if (filters?.active !== undefined) params = params.set('active', String(filters.active));
    if (filters?.portalAccess !== undefined) params = params.set('portalAccess', String(filters.portalAccess));
    if (filters?.state) params = params.set('state', filters.state);
    if (filters?.municipality) params = params.set('municipality', filters.municipality);
    return this.http.get<CustomerList[]>(this.baseUrl, { params });
  }

  getById(id: string): Observable<CustomerDetails> {
    return this.http.get<CustomerDetails>(`${this.baseUrl}/${id}`);
  }

  create(data: CustomerCreate): Observable<CustomerDetails> {
    return this.http.post<CustomerDetails>(this.baseUrl, data);
  }

  update(id: string, data: CustomerEdit): Observable<CustomerDetails> {
    return this.http.put<CustomerDetails>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  changePortalPassword(id: string, newPassword: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/portal-password`, { newPassword });
  }
}
