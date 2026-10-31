import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { CashRegisterApplicationService } from '@features/finance/treasury/cash-register/services/application/cash-register-application.service';
import { CashRegisterResponse } from '@features/finance/treasury/cash-register/models/interfaces/closure.interface';
import { CashRegisterOpenDialogComponent } from '@features/finance/treasury/cash-register/components/cash-register-open-dialog/cash-register-open-dialog.component';

describe('CashRegisterOpenDialogComponent', () => {
  let fixture: ComponentFixture<CashRegisterOpenDialogComponent>;
  let component: CashRegisterOpenDialogComponent;

  const service = {
    activeClosure: signal<CashRegisterResponse | null>(null),
    loading: signal(false),
    currentUserName: signal('Cajero'),
    loadActiveClosure: vi.fn(() => of(null)),
    openRegister: vi.fn(() => of(createClosure())),
    closeRegister: vi.fn(() => of(null)),
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
    service.openRegister.mockReturnValue(of(createClosure()));

    await TestBed.configureTestingModule({
      imports: [CashRegisterOpenDialogComponent],
      providers: [
        provideRouter([]),
        { provide: AuthorizationService, useValue: { can: () => true } },
        { provide: CashRegisterApplicationService, useValue: service },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CashRegisterOpenDialogComponent);
    component = fixture.componentInstance;
  });

  it('resets the form with the current user when the dialog opens', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    expect(component.openForm.getRawValue()).toEqual({
      openedByName: 'Cajero',
      openingBalance: 0,
    });
  });

  it('opens the register through the application service and closes the dialog', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    component.openForm.patchValue({ openingBalance: 150 });

    component.submit();

    expect(service.openRegister).toHaveBeenCalledWith('Cajero', 150);
    expect(component.visible()).toBe(false);
  });

  it('does not submit an invalid form', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    component.openForm.patchValue({ openedByName: '' });

    component.submit();

    expect(service.openRegister).not.toHaveBeenCalled();
    expect(component.visible()).toBe(true);
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
    details: [],
    totalInvoiced: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    balance: 100,
    revenueSummary: [],
    expenseSummary: [],
    openingBalance: 100,
    totalIncome: 0,
    totalExpense: 0,
    expectedBalance: 100,
    declaredBalance: null,
    difference: null,
    movements: [],
  };
}
