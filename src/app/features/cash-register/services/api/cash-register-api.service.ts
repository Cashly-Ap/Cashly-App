import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';
import {
  CashRegisterResponse,
  OpenRegisterRequest,
  CloseRegisterRequest,
} from '@features/cash-register/models/interfaces/closure.interface';

@Injectable({ providedIn: 'root' })
export class CashRegisterApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/cash-register`;

  open(request: OpenRegisterRequest): Observable<CashRegisterResponse> {
    return this.http.post<CashRegisterResponse>(`${this.baseUrl}/open`, request);
  }

  getActive(): Observable<CashRegisterResponse> {
    return this.http.get<CashRegisterResponse>(`${this.baseUrl}/active`);
  }

  close(
    id: string,
    request: CloseRegisterRequest,
  ): Observable<CashRegisterResponse> {
    return this.http.post<CashRegisterResponse>(
      `${this.baseUrl}/${id}/close`,
      request,
    );
  }

  getHistory(
    page: number,
    size: number,
    dateFrom?: string,
    dateTo?: string,
    sort?: string,
  ): Observable<PagedResponse<CashRegisterResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (dateFrom) params = params.set('dateFrom', dateFrom);
    if (dateTo) params = params.set('dateTo', dateTo);
    if (sort) params = params.set('sort', sort);
    return this.http.get<PagedResponse<CashRegisterResponse>>(
      `${this.baseUrl}/history`,
      { params },
    );
  }

  exportExcel(dateFrom: string, dateTo: string): Observable<Blob> {
    const params = new HttpParams()
      .set('dateFrom', dateFrom)
      .set('dateTo', dateTo);
    return this.http.get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob',
    });
  }
}
