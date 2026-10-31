import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { CashRegisterApplicationService } from '@features/finance/treasury/cash-register/services/application/cash-register-application.service';
import { CashRegisterResponse } from '@features/finance/treasury/cash-register/models/interfaces/closure.interface';
import { CashRegisterDetailDialogComponent } from '@features/finance/treasury/cash-register/components/cash-register-detail-dialog/cash-register-detail-dialog.component';

describe('CashRegisterDetailDialogComponent', () => {
  let fixture: ComponentFixture<CashRegisterDetailDialogComponent>;
  let component: CashRegisterDetailDialogComponent;

  const activeClosure = signal<CashRegisterResponse | null>(null);
  const service = {
    activeClosure,
    loading: signal(false),
    currentUserName: signal('Cajero'),
    loadActiveClosure: vi.fn(() => of(activeClosure())),
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
    activeClosure.set(createClosure());

    await TestBed.configureTestingModule({
      imports: [CashRegisterDetailDialogComponent],
      providers: [{ provide: CashRegisterApplicationService, useValue: service }],
    }).compileComponents();

    fixture = TestBed.createComponent(CashRegisterDetailDialogComponent);
    component = fixture.componentInstance;
  });

  it('exposes the closure payment method breakdown', () => {
    expect(component.details()).toHaveLength(2);
    expect(component.details()[0].paymentMethodName).toBe('Efectivo');
  });

  it('renders the breakdown when the dialog opens', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    expect(document.body.textContent).toContain('Efectivo');
    expect(document.body.textContent).toContain('Transferencia');
  });

  it('shows an empty state when the closure has no details', () => {
    activeClosure.set({ ...createClosure(), details: [] });
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    expect(component.details()).toHaveLength(0);
    expect(document.body.textContent).toContain('Sin movimientos');
  });
});

function createClosure(): CashRegisterResponse {
  return {
    id: 'cash-1',
    closureDate: '2026-08-14',
    status: 'OPEN',
    openedBy: 'user-1',
    openedByName: 'Cajero',
    openedAt: '2026-08-14T08:00:00Z',
    closedBy: null,
    closedByName: null,
    closedAt: null,
    closingNotes: null,
    details: [
      {
        id: 'detail-1',
        paymentMethodId: 'pm-1',
        paymentMethodName: 'Efectivo',
        transactionCount: 3,
        expectedAmount: 150,
      },
      {
        id: 'detail-2',
        paymentMethodId: 'pm-2',
        paymentMethodName: 'Transferencia',
        transactionCount: 1,
        expectedAmount: 100,
      },
    ],
    totalInvoiced: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    balance: 250,
    revenueSummary: [],
    expenseSummary: [],
    openingBalance: 250,
    totalIncome: 0,
    totalExpense: 0,
    expectedBalance: 250,
    declaredBalance: null,
    difference: null,
    movements: [],
  };
}
