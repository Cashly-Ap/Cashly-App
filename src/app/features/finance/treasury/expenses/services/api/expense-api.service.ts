import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';
import { CashRegisterApiService } from '@features/finance/treasury/cash-register/services/api/cash-register-api.service';
import { CashMovementResponse } from '@features/finance/treasury/cash-register/models/interfaces/closure.interface';
import {
  Expense,
  ExpenseFilters,
} from '@features/finance/treasury/expenses/models/interfaces/expense.interface';

const HISTORY_PAGE_SIZE = 200;

@Injectable({ providedIn: 'root' })
export class ExpenseApiService {
  private readonly cashRegisterApi = inject(CashRegisterApiService);

  list(filters: ExpenseFilters = {}): Observable<PagedResponse<Expense>> {
    return this.cashRegisterApi
      .getHistory(
        0,
        HISTORY_PAGE_SIZE,
        filters.dateFrom,
        filters.dateTo,
        'openedAt,desc',
        'DETAILED',
      )
      .pipe(map((response) => this.paginate(this.flatten(response.content), filters)));
  }

  getById(id: string): Observable<Expense | undefined> {
    return this.list({ page: 0, size: 1000 }).pipe(
      map((response) => response.content.find((expense) => expense.id === id)),
    );
  }

  private flatten(
    sessions: {
      id: string;
      openedAt: string;
      movements: CashMovementResponse[];
    }[],
  ): Expense[] {
    return sessions.flatMap((session) =>
      session.movements
        .filter((movement) => movement.type === 'EXPENSE' && movement.direction === 'OUT')
        .map((movement) => ({
          id: movement.id,
          registerId: session.id,
          registerOpenedAt: session.openedAt,
          amount: Number(movement.amount),
          description: movement.description ?? '',
          paymentMethodId: movement.paymentMethodId,
          paymentMethodName: movement.paymentMethodName,
          createdByName: movement.createdByName,
          occurredAt: movement.occurredAt,
        })),
    );
  }

  private paginate(expenses: Expense[], filters: ExpenseFilters): PagedResponse<Expense> {
    const search = filters.search?.trim().toLowerCase();
    const filtered = expenses.filter((expense) => {
      if (filters.paymentMethodId && expense.paymentMethodId !== filters.paymentMethodId) {
        return false;
      }
      if (!search) return true;
      return [expense.description, expense.paymentMethodName, expense.createdByName]
        .filter((value): value is string => !!value)
        .some((value) => value.toLowerCase().includes(search));
    });

    const orderBy = filters.orderBy ?? 'occurredAt';
    const direction = filters.orderDir === 'asc' ? 1 : -1;
    const sorted = [...filtered].sort((a, b) => {
      const first = a[orderBy];
      const second = b[orderBy];
      if (typeof first === 'number' && typeof second === 'number') {
        return (first - second) * direction;
      }
      return String(first).localeCompare(String(second)) * direction;
    });

    const size = filters.size ?? 10;
    const page = filters.page ?? 0;
    const start = page * size;
    const content = sorted.slice(start, start + size);
    const totalElements = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / size));

    return {
      content,
      totalElements,
      totalPages,
      size,
      number: page,
      first: page === 0,
      last: page >= totalPages - 1,
      empty: totalElements === 0,
    };
  }
}
