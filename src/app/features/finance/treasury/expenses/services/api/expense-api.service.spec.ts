import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpParams } from '@angular/common/http';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExpenseApiService } from '@features/finance/treasury/expenses/services/api/expense-api.service';
import { CashRegisterApiService } from '@features/finance/treasury/cash-register/services/api/cash-register-api.service';
import { CashRegisterResponse } from '@features/finance/treasury/cash-register/models/interfaces/closure.interface';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';
import { Expense } from '@features/finance/treasury/expenses/models/interfaces/expense.interface';

describe('ExpenseApiService', () => {
  const expensesPage: PagedResponse<Expense> = {
    content: [createExpense('expense-2', 12, false), createExpense('expense-1', 60, true)],
    totalElements: 2,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: false,
  };

  const httpGet = vi.fn(() => of(expensesPage));
  const getHistory = vi.fn(() => of({ content: [createSession()], totalElements: 1 }));
  const addMovement = vi.fn(() =>
    of({
      id: 'expense-new',
      direction: 'OUT',
      type: 'EXPENSE',
      amount: 25,
      paymentMethodId: 'pm-cash',
      paymentMethodName: 'Cash',
      description: 'Transporte',
      sourceType: 'MANUAL',
      sourceId: null,
      createdBy: 'user-1',
      createdByName: 'Cajero',
      occurredAt: '2026-11-09T14:30:00',
      cancelled: false,
      cancellationReason: null,
      cancelledAt: null,
      cancelledBy: null,
      cancelledByName: null,
    }),
  );
  const cancelMovement = vi.fn(() => of(void 0));

  beforeEach(() => {
    httpGet.mockClear();
    getHistory.mockClear();
    addMovement.mockClear();
    cancelMovement.mockClear();
    TestBed.configureTestingModule({
      providers: [
        ExpenseApiService,
        { provide: HttpClient, useValue: { get: httpGet } },
        {
          provide: CashRegisterApiService,
          useValue: { getHistory, addMovement, cancelMovement },
        },
      ],
    });
  });

  function createService(): ExpenseApiService {
    return TestBed.runInInjectionContext(() => TestBed.inject(ExpenseApiService));
  }

  it('requests the dedicated expenses endpoint with pagination and sort', () => {
    const service = createService();

    service.list({ page: 0, size: 10, orderBy: 'amount', orderDir: 'asc' }).subscribe((page) => {
      expect(page.content).toHaveLength(2);
      expect(page.totalElements).toBe(2);
    });

    const [, options] = httpGet.mock.calls[0] as unknown as [string, { params: HttpParams }];
    expect(options.params.get('page')).toBe('0');
    expect(options.params.get('size')).toBe('10');
    expect(options.params.get('sort')).toBe('amount,asc');
  });

  it('sends date, register, payment method and search filters to the backend', () => {
    const service = createService();

    service
      .list({
        dateFrom: '2026-11-03',
        dateTo: '2026-11-11',
        registerId: 'cash-1',
        paymentMethodId: 'pm-cash',
        search: 'papel',
      })
      .subscribe();

    const [, options] = httpGet.mock.calls[0] as unknown as [string, { params: HttpParams }];
    expect(options.params.get('dateFrom')).toBe('2026-11-03');
    expect(options.params.get('dateTo')).toBe('2026-11-11');
    expect(options.params.get('registerId')).toBe('cash-1');
    expect(options.params.get('paymentMethodId')).toBe('pm-cash');
    expect(options.params.get('search')).toBe('papel');
  });

  it('creates an expense movement against the selected register with its date', () => {
    const service = createService();

    service
      .create({
        registerId: 'cash-closed',
        amount: 25,
        description: 'Transporte',
        paymentMethodId: 'pm-cash',
        occurredAt: '2026-11-09T14:30:00',
      })
      .subscribe();

    expect(addMovement).toHaveBeenCalledWith('cash-closed', {
      direction: 'OUT',
      type: 'EXPENSE',
      amount: 25,
      paymentMethodId: 'pm-cash',
      description: 'Transporte',
      occurredAt: '2026-11-09T14:30:00',
    });
  });

  it('cancels a movement with the given reason', () => {
    const service = createService();

    service.cancel('expense-1', 'Registrado por error').subscribe();

    expect(cancelMovement).toHaveBeenCalledWith('expense-1', {
      reason: 'Registrado por error',
    });
  });

  it('lists open and closed registers as options', () => {
    const service = createService();

    service.listRegisters().subscribe((registers) => {
      expect(registers).toEqual([
        {
          id: 'cash-1',
          openedAt: '2026-11-09T08:00:00',
          closedAt: null,
          status: 'OPEN',
          openedByName: 'Cajero',
        },
      ]);
    });

    expect(getHistory).toHaveBeenCalledWith(
      0,
      100,
      undefined,
      undefined,
      'openedAt,desc',
      'SIMPLE',
    );
  });
});

function createExpense(id: string, amount: number, cancelled: boolean): Expense {
  return {
    id,
    registerId: 'cash-1',
    registerOpenedAt: '2026-11-09T08:00:00',
    registerStatus: 'OPEN',
    amount,
    description: cancelled ? 'Servicios' : 'Compra de papel',
    paymentMethodId: cancelled ? 'pm-bank' : 'pm-cash',
    paymentMethodName: cancelled ? 'Bank transfer' : 'Cash',
    createdByName: 'Cajero',
    occurredAt: '2026-11-09T11:00:00',
    cancelled,
    cancellationReason: cancelled ? 'Registrado por error' : null,
    cancelledAt: cancelled ? '2026-11-10T09:00:00' : null,
    cancelledBy: cancelled ? 'user-1' : null,
    cancelledByName: cancelled ? 'Cajero' : null,
  };
}

function createSession(): CashRegisterResponse {
  return {
    id: 'cash-1',
    closureDate: '2026-11-09',
    status: 'OPEN',
    openedBy: 'user-1',
    openedByName: 'Cajero',
    openedAt: '2026-11-09T08:00:00',
    closedBy: null,
    closedByName: null,
    closedAt: null,
    closingNotes: null,
    details: [],
    totalInvoiced: 0,
    totalRevenue: 0,
    totalExpenses: 72,
    balance: 0,
    revenueSummary: [],
    expenseSummary: [],
    openingBalance: 100,
    totalIncome: 0,
    totalExpense: 72,
    expectedBalance: 28,
    declaredBalance: null,
    difference: null,
    movements: [],
  };
}
