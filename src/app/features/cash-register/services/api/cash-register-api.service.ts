import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';
import {
  CashRegisterResponse,
  OpenRegisterRequest,
  CloseRegisterRequest,
  VerifyRegisterRequest,
} from '../../models/interfaces/closure.interface';

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

  verify(
    id: string,
    request: VerifyRegisterRequest,
  ): Observable<CashRegisterResponse> {
    return this.http.post<CashRegisterResponse>(
      `${this.baseUrl}/${id}/verify`,
      request,
    );
  }

  getHistory(
    page: number,
    size: number,
  ): Observable<PagedResponse<CashRegisterResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PagedResponse<CashRegisterResponse>>(
      `${this.baseUrl}/history`,
      { params },
    );
  }
}
