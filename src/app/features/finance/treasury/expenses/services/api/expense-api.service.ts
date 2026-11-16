import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';
import { CashRegisterApiService } from '@features/finance/treasury/cash-register/services/api/cash-register-api.service';
import {
  CashMovementRequest,
  CashMovementResponse,
} from '@features/finance/treasury/cash-register/models/interfaces/closure.interface';
import {
  Expense,
  ExpenseCreate,
  ExpenseFilters,
  ExpenseRegisterOption,
} from '@features/finance/treasury/expenses/models/interfaces/expense.interface';

const HISTORY_PAGE_SIZE = 200;
const REGISTER_PAGE_SIZE = 100;

@Injectable({ providedIn: 'root' })
export class ExpenseApiService {
  private readonly http = inject(HttpClient);
  private readonly cashRegisterApi = inject(CashRegisterApiService);
  private readonly baseUrl = `${environment.apiUrl}/cash-register`;

  list(filters: ExpenseFilters = {}): Observable<PagedResponse<Expense>> {
    let params = new HttpParams()
      .set('page', String(filters.page ?? 0))
      .set('size', String(filters.size ?? 10))
      .set('sort', `${filters.orderBy ?? 'occurredAt'},${filters.orderDir ?? 'desc'}`);

    if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
    if (filters.registerId) params = params.set('registerId', filters.registerId);
    if (filters.paymentMethodId) {
      params = params.set('paymentMethodId', filters.paymentMethodId);
    }
    if (filters.search) params = params.set('search', filters.search);

    return this.http.get<PagedResponse<Expense>>(`${this.baseUrl}/expenses`, { params });
  }

  getById(id: string): Observable<Expense | undefined> {
    return this.list({ page: 0, size: 1000 }).pipe(
      map((response) => response.content.find((expense) => expense.id === id)),
    );
  }

  listRegisters(): Observable<ExpenseRegisterOption[]> {
    return this.cashRegisterApi
      .getHistory(0, REGISTER_PAGE_SIZE, undefined, undefined, 'openedAt,desc', 'SIMPLE')
      .pipe(
        map((response) =>
          response.content.map((session) => ({
            id: session.id,
            openedAt: session.openedAt,
            closedAt: session.closedAt,
            status: session.status,
            openedByName: session.openedByName,
          })),
        ),
      );
  }

  create(request: ExpenseCreate): Observable<CashMovementResponse> {
    return this.cashRegisterApi.addMovement(request.registerId, this.toMovementRequest(request));
  }

  cancel(id: string, reason: string): Observable<CashMovementResponse> {
    return this.cashRegisterApi.cancelMovement(id, { reason });
  }

  private toMovementRequest(request: ExpenseCreate): CashMovementRequest {
    return {
      direction: 'OUT',
      type: 'EXPENSE',
      amount: request.amount,
      paymentMethodId: request.paymentMethodId,
      description: request.description,
      occurredAt: request.occurredAt,
    };
  }
}
