import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserList, UserDetails, UserCreate, UserEdit } from '@features/users/models/interfaces';
import { BusinessModule } from '@features/users/models/enums';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

export interface UserFilters {
  search?: string;
  role?: string;
  active?: boolean;
  page?: number;
  size?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/users';

  getAll(filters?: UserFilters): Observable<PagedResponse<UserList>> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.role) params = params.set('role', filters.role);
    if (filters?.active !== undefined) params = params.set('active', String(filters.active));
    if (filters?.page !== undefined) params = params.set('page', String(filters.page));
    if (filters?.size !== undefined) params = params.set('size', String(filters.size));
    if (filters?.orderBy) params = params.set('orderBy', filters.orderBy);
    if (filters?.orderDir) params = params.set('orderDir', filters.orderDir);
    return this.http.get<PagedResponse<UserList>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<UserDetails> {
    return this.http.get<UserDetails>(`${this.baseUrl}/${id}`);
  }

  create(data: UserCreate): Observable<UserDetails> {
    return this.http.post<UserDetails>(this.baseUrl, data);
  }

  update(id: string, data: UserEdit): Observable<UserDetails> {
    return this.http.put<UserDetails>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  changePassword(id: string, password: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/password`, { password });
  }

  changeEmail(id: string, email: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/email`, { email });
  }

  updateModulePermissions(
    id: string,
    modulePermissions: BusinessModule[],
  ): Observable<UserDetails> {
    return this.http.put<UserDetails>(`${this.baseUrl}/${id}/module-permissions`, {
      modulePermissions,
    });
  }
}
