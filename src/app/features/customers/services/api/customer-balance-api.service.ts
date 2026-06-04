import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { CustomerBalanceResponse, BalanceTransactionResponse } from '../../models/interfaces';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

export interface CreateAdvanceRequest {
  amount: number;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class CustomerBalanceApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/customers`;

  getBalance(customerId: string): Observable<CustomerBalanceResponse> {
    return this.http.get<CustomerBalanceResponse>(
      `${this.baseUrl}/${customerId}/balance`,
    );
  }

  getTransactions(
    customerId: string,
    page = 0,
    size = 10,
  ): Observable<PagedResponse<BalanceTransactionResponse>> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size));

    return this.http.get<PagedResponse<BalanceTransactionResponse>>(
      `${this.baseUrl}/${customerId}/balance/transactions`,
      { params },
    );
  }

  createAdvance(
    customerId: string,
    request: CreateAdvanceRequest,
  ): Observable<CustomerBalanceResponse> {
    return this.http.post<CustomerBalanceResponse>(
      `${this.baseUrl}/${customerId}/balance/advance`,
      request,
    );
  }
}
