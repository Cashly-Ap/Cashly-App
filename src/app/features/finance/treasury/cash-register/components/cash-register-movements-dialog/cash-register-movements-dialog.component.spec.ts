import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CashRegisterMovementsDialogComponent } from '@features/finance/treasury/cash-register/components/cash-register-movements-dialog/cash-register-movements-dialog.component';
import { CashRegisterResponse } from '@features/finance/treasury/cash-register/models/interfaces/closure.interface';

describe('CashRegisterMovementsDialogComponent', () => {
  let fixture: ComponentFixture<CashRegisterMovementsDialogComponent>;
  let component: CashRegisterMovementsDialogComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashRegisterMovementsDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CashRegisterMovementsDialogComponent);
    component = fixture.componentInstance;
  });

  it('shows movement details for the selected session', () => {
    fixture.componentRef.setInput('register', createRegister());
    component.visible.set(true);
    fixture.detectChanges();

    const text = document.body.textContent ?? '';
    expect(text).toContain('Movimientos de la sesión');
    expect(text).toContain('Ingreso manual');
    expect(text).toContain('+50,00$');
  });

  it('shows an empty state when the session has no movements', () => {
    fixture.componentRef.setInput('register', createRegister({ movements: [] }));
    component.visible.set(true);
    fixture.detectChanges();

    expect(document.body.textContent).toContain('Sin movimientos');
  });
});

function createRegister(overrides: Partial<CashRegisterResponse> = {}): CashRegisterResponse {
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
    details: [],
    totalInvoiced: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    balance: 100,
    revenueSummary: [],
    expenseSummary: [],
    openingBalance: 100,
    totalIncome: 50,
    totalExpense: 0,
    expectedBalance: 150,
    declaredBalance: null,
    difference: null,
    movements: [
      {
        id: 'movement-1',
        direction: 'IN',
        type: 'MANUAL_INCOME',
        amount: 50,
        paymentMethodId: 'method-1',
        paymentMethodName: 'Cash',
        description: null,
        sourceType: null,
        sourceId: null,
        createdBy: 'user-1',
        createdByName: 'gabriel',
        occurredAt: '2026-08-14T09:00:00Z',
        cancelled: false,
        cancellationReason: null,
        cancelledAt: null,
        cancelledBy: null,
        cancelledByName: null,
      },
    ],
    ...overrides,
  };
}
