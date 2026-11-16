import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';
import { SupplierBalanceResponse } from '@features/partners/suppliers/models/interfaces/supplier-balance.interface';
import { SupplierBalanceTransactionResponse } from '@features/partners/suppliers/models/interfaces/supplier-balance-transaction.interface';
import { SupplierBalanceMovementRequest } from '@features/partners/suppliers/models/interfaces/supplier-balance-action.interface';

@Injectable({ providedIn: 'root' })
export class SupplierBalanceApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/suppliers`;

  getBalance(supplierId: string): Observable<SupplierBalanceResponse> {
    return this.http.get<SupplierBalanceResponse>(`${this.baseUrl}/${supplierId}/balance`);
  }

  getTransactions(
    supplierId: string,
    page: number,
    size: number,
  ): Observable<PagedResponse<SupplierBalanceTransactionResponse>> {
    return this.http.get<PagedResponse<SupplierBalanceTransactionResponse>>(
      `${this.baseUrl}/${supplierId}/balance/transactions`,
      { params: { page, size } },
    );
  }

  createAdvance(
    supplierId: string,
    request: SupplierBalanceMovementRequest,
  ): Observable<SupplierBalanceResponse> {
    return this.http.post<SupplierBalanceResponse>(
      `${this.baseUrl}/${supplierId}/balance/advance`,
      request,
    );
  }

  createRefund(
    supplierId: string,
    request: SupplierBalanceMovementRequest,
  ): Observable<SupplierBalanceResponse> {
    return this.http.post<SupplierBalanceResponse>(
      `${this.baseUrl}/${supplierId}/balance/refund`,
      request,
    );
  }
}
