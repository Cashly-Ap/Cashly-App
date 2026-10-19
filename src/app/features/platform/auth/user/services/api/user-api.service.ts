import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserList } from '@features/platform/auth/user/models/interfaces/user-list.interface';
import { UserDetails } from '@features/platform/auth/user/models/interfaces/user-details.interface';
import { UserCreate } from '@features/platform/auth/user/models/interfaces/user-create.interface';
import { UserEdit } from '@features/platform/auth/user/models/interfaces/user-edit.interface';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
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
    if (filters?.role) params = params.set('roleId', filters.role);
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
    const { email, password, userName, firstName, lastName, address, phone, roleId, departmentId } =
      data;
    return this.http.post<UserDetails>(this.baseUrl, {
      email,
      password,
      userName,
      firstName,
      lastName,
      address,
      phone,
      roleId,
      departmentId,
    });
  }

  update(id: string, data: UserEdit): Observable<UserDetails> {
    const { userName, firstName, lastName, address, phone, roleId, departmentId, active } = data;
    return this.http.put<UserDetails>(`${this.baseUrl}/${id}`, {
      userName,
      firstName,
      lastName,
      address,
      phone,
      roleId,
      departmentId,
      active,
    });
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
}
