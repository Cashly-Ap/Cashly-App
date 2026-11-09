import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExpensesApplicationService } from '@features/finance/treasury/expenses/services/application/expenses-application.service';
import { ExpenseApiService } from '@features/finance/treasury/expenses/services/api/expense-api.service';
import { CashRegisterApplicationService } from '@features/finance/treasury/cash-register/services/application/cash-register-application.service';
import { PaymentMethodApplicationService } from '@features/finance/treasury/payment-methods/services/application/payment-method-application.service';
import { Expense } from '@features/finance/treasury/expenses/models/interfaces/expense.interface';

describe('ExpensesApplicationService', () => {
  const activeClosure = signal({ id: 'cash-1', status: 'OPEN' });
  const paymentMethods = signal([
    { id: 'pm-cash', code: 'CASH', name: 'Cash', description: null, isActive: true },
    { id: 'pm-off', code: 'OFF', name: 'Inactive', description: null, isActive: false },
  ]);
  const addMovement = vi.fn(() => of(null));
  const loadActiveClosure = vi.fn(() => of(null));
  const loadPaymentMethods = vi.fn(() => of({ content: [], totalElements: 0 }));
  const list = vi.fn(() =>
    of({
      content: [createExpense()],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
      first: true,
      last: true,
      empty: false,
    }),
  );

  beforeEach(() => {
    addMovement.mockClear();
    loadActiveClosure.mockClear();
    loadPaymentMethods.mockClear();
    list.mockClear();

    TestBed.configureTestingModule({
      providers: [
        ExpensesApplicationService,
        { provide: ExpenseApiService, useValue: { list, getById: vi.fn() } },
        {
          provide: CashRegisterApplicationService,
          useValue: {
            activeClosure,
            loadActiveClosure,
            addMovement,
          },
        },
        {
          provide: PaymentMethodApplicationService,
          useValue: { paymentMethods, loadPaymentMethods },
        },
      ],
    });
  });

  function createService(): ExpensesApplicationService {
    return TestBed.runInInjectionContext(() => TestBed.inject(ExpensesApplicationService));
  }

  it('loads expenses with filters and stores the page', () => {
    const service = createService();

    service.loadExpenses({ page: 1, size: 25, search: 'papel' }).subscribe();

    expect(list).toHaveBeenCalledWith({ page: 1, size: 25, search: 'papel' });
    expect(service.expenses()).toHaveLength(1);
    expect(service.totalElements()).toBe(1);
    expect(service.count()).toBe(1);
    expect(service.totalAmount()).toBe(12);
  });

  it('exposes only active payment methods', () => {
    const service = createService();
    expect(service.paymentMethods().map((method) => method.id)).toEqual(['pm-cash']);
  });

  it('creates an expense movement against the open register', () => {
    const service = createService();

    service.createExpense({ amount: 25, description: 'Transporte', paymentMethodId: 'pm-cash' });

    expect(addMovement).toHaveBeenCalledWith(
      'cash-1',
      expect.objectContaining({
        direction: 'OUT',
        type: 'EXPENSE',
        amount: 25,
        paymentMethodId: 'pm-cash',
        description: 'Transporte',
      }),
    );
  });

  it('loads the active register and payment methods as context', () => {
    const service = createService();

    service.loadContext().subscribe();

    expect(loadActiveClosure).toHaveBeenCalled();
    expect(loadPaymentMethods).toHaveBeenCalledWith({ active: true, page: 0, size: 100 });
  });

  it('rejects expenses when there is no open register', () => {
    const service = createService();
    activeClosure.set(null);

    expect(() =>
      service.createExpense({ amount: 10, description: 'Limpieza', paymentMethodId: 'pm-cash' }),
    ).toThrow('No hay una caja abierta para registrar el gasto');

    activeClosure.set({ id: 'cash-1', status: 'OPEN' });
  });
});

function createExpense(): Expense {
  return {
    id: 'expense-1',
    registerId: 'cash-1',
    registerOpenedAt: '2026-11-09T08:00:00',
    amount: 12,
    description: 'Compra de papel',
    paymentMethodId: 'pm-cash',
    paymentMethodName: 'Cash',
    createdByName: 'gabriel',
    occurredAt: '2026-11-09T14:23:00',
  };
}
