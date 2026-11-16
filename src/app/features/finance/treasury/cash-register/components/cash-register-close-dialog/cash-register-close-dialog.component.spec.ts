import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { CashRegisterApplicationService } from '@features/finance/treasury/cash-register/services/application/cash-register-application.service';
import { CashRegisterResponse } from '@features/finance/treasury/cash-register/models/interfaces/closure.interface';
import { CashRegisterCloseDialogComponent } from '@features/finance/treasury/cash-register/components/cash-register-close-dialog/cash-register-close-dialog.component';

describe('CashRegisterCloseDialogComponent', () => {
  let fixture: ComponentFixture<CashRegisterCloseDialogComponent>;
  let component: CashRegisterCloseDialogComponent;

  const activeClosure = signal<CashRegisterResponse | null>(null);
  const service = {
    activeClosure,
    loading: signal(false),
    currentUserName: signal('Cajero'),
    loadActiveClosure: vi.fn(() => of(activeClosure())),
    openRegister: vi.fn(() => of(null)),
    closeRegister: vi.fn(() => of(activeClosure())),
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
    activeClosure.set(createClosure());
    service.closeRegister.mockReturnValue(of(createClosure()));

    await TestBed.configureTestingModule({
      imports: [CashRegisterCloseDialogComponent],
      providers: [
        provideRouter([]),
        { provide: AuthorizationService, useValue: { can: () => true } },
        { provide: CashRegisterApplicationService, useValue: service },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CashRegisterCloseDialogComponent);
    component = fixture.componentInstance;
  });

  it('resets the form with the expected balance when the dialog opens', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    expect(component.closeForm.getRawValue()).toEqual({
      closedByName: 'Cajero',
      declaredBalance: 250,
      closingNotes: '',
    });
    expect(component.expectedBalance()).toBe(250);
  });

  it('closes the register through the application service and closes the dialog', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    component.closeForm.patchValue({ closingNotes: 'Sin novedades' });

    component.submit();

    expect(service.closeRegister).toHaveBeenCalledWith('cash-1', {
      closedByName: 'Cajero',
      declaredBalance: 250,
      closingNotes: 'Sin novedades',
    });
    expect(component.visible()).toBe(false);
  });

  it('does not close the register without an active closure', () => {
    activeClosure.set(null);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    component.closeForm.patchValue({ closedByName: 'Cajero' });

    component.submit();

    expect(service.closeRegister).not.toHaveBeenCalled();
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
