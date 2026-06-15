import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PriceTypeList, PriceTypeDetails, PriceTypeCreate, PriceTypeUpdate } from '@features/price-types/models/interfaces';

@Injectable({ providedIn: 'root' })
export class PriceTypeApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/price-types';

  findAll(orderBy?: string, orderDir?: string): Observable<PriceTypeList[]> {
    let params = new HttpParams();
    if (orderBy) params = params.set('orderBy', orderBy);
    if (orderDir) params = params.set('orderDir', orderDir);
    return this.http.get<PriceTypeList[]>(this.baseUrl, { params });
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
