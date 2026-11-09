import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExpenseApiService } from '@features/finance/treasury/expenses/services/api/expense-api.service';
import { CashRegisterApiService } from '@features/finance/treasury/cash-register/services/api/cash-register-api.service';
import { CashRegisterResponse } from '@features/finance/treasury/cash-register/models/interfaces/closure.interface';

describe('ExpenseApiService', () => {
  const getHistory = vi.fn(() => of({ content: [createSession()], totalElements: 1 }));

  beforeEach(() => {
    getHistory.mockClear();
    TestBed.configureTestingModule({
      providers: [ExpenseApiService, { provide: CashRegisterApiService, useValue: { getHistory } }],
    });
  });

  function createService(): ExpenseApiService {
    return TestBed.runInInjectionContext(() => TestBed.inject(ExpenseApiService));
  }

  it('flattens only cash expenses from session history', () => {
    const service = createService();

    service.list().subscribe((page) => {
      expect(page.content).toHaveLength(2);
      expect(page.content.map((expense) => expense.amount)).toEqual([12, 60]);
      expect(page.totalElements).toBe(2);
    });
  });

  it('filters by search text and payment method', () => {
    const service = createService();

    service.list({ search: 'papel', paymentMethodId: 'pm-cash' }).subscribe((page) => {
      expect(page.content).toHaveLength(1);
      expect(page.content[0].description).toBe('Compra de papel');
    });

    service.list({ search: 'no-existe' }).subscribe((page) => {
      expect(page.content).toHaveLength(0);
      expect(page.empty).toBe(true);
    });
  });

  it('paginates and sorts the flattened expenses', () => {
    const service = createService();

    service.list({ page: 0, size: 1, orderBy: 'amount', orderDir: 'asc' }).subscribe((page) => {
      expect(page.content).toHaveLength(1);
      expect(page.content[0].amount).toBe(12);
      expect(page.totalPages).toBe(2);
      expect(page.last).toBe(false);
    });

    service.list({ page: 1, size: 1, orderBy: 'amount', orderDir: 'asc' }).subscribe((page) => {
      expect(page.content[0].amount).toBe(60);
      expect(page.last).toBe(true);
    });
  });
});

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
    movements: [
      {
        id: 'expense-1',
        direction: 'OUT',
        type: 'EXPENSE',
        amount: 60,
        paymentMethodId: 'pm-bank',
        paymentMethodName: 'Bank transfer',
        description: 'Servicios',
        sourceType: 'MANUAL',
        sourceId: null,
        createdBy: 'user-1',
        createdByName: 'Cajero',
        occurredAt: '2026-11-09T10:00:00',
      },
      {
        id: 'expense-2',
        direction: 'OUT',
        type: 'EXPENSE',
        amount: 12,
        paymentMethodId: 'pm-cash',
        paymentMethodName: 'Cash',
        description: 'Compra de papel',
        sourceType: 'MANUAL',
        sourceId: null,
        createdBy: 'user-1',
        createdByName: 'Cajero',
        occurredAt: '2026-11-09T11:00:00',
      },
      {
        id: 'income-1',
        direction: 'IN',
        type: 'PAYMENT',
        amount: 100,
        paymentMethodId: 'pm-cash',
        paymentMethodName: 'Cash',
        description: 'Pago',
        sourceType: 'PAYMENT',
        sourceId: null,
        createdBy: 'user-1',
        createdByName: 'Cajero',
        occurredAt: '2026-11-09T09:00:00',
      },
    ],
  };
}
