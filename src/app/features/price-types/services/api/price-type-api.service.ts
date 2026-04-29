import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PriceTypeList, PriceTypeDetails, PriceTypeCreate, PriceTypeUpdate } from '../../models/interfaces';

@Injectable({ providedIn: 'root' })
export class PriceTypeApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/price-types';

  findAll(): Observable<PriceTypeList[]> {
    return this.http.get<PriceTypeList[]>(this.baseUrl);
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
