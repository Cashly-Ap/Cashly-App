import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserList, UserDetails, UserCreate, UserEdit } from '../../models/interfaces';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/users';

  getAll(): Observable<UserList[]> {
    return this.http.get<UserList[]>(this.baseUrl);
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
}
