import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerList, CustomerDetails, CustomerCreate, CustomerEdit } from '../../models/interfaces';

@Injectable({ providedIn: 'root' })
export class CustomerApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/customers';

  getAll(): Observable<CustomerList[]> {
    return this.http.get<CustomerList[]>(this.baseUrl);
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
}
