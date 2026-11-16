import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AccountsPayableFilters } from '@features/finance/treasury/payables/reporting/models/interfaces';

@Injectable({ providedIn: 'root' })
export class PayablesPdfApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reports/finance`;

  getAccountsPayablePdf(filters: AccountsPayableFilters = {}): Observable<Blob> {
    let params = new HttpParams();

    if (filters.supplierId) {
      params = params.set('supplierId', filters.supplierId);
    }
    if (filters.overdueOnly) {
      params = params.set('overdueOnly', String(filters.overdueOnly));
    }

    return this.http.get(`${this.baseUrl}/accounts-payable/pdf`, {
      responseType: 'blob',
      params,
    });
  }
}
