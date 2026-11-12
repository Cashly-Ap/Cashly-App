import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { CashRegisterApplicationService } from '@features/finance/treasury/cash-register/services/application/cash-register-application.service';
import { CashRegisterResponse } from '@features/finance/treasury/cash-register/models/interfaces/closure.interface';
import { CashRegisterOpenDialogComponent } from '@features/finance/treasury/cash-register/components/cash-register-open-dialog/cash-register-open-dialog.component';
import { CashRegisterCloseDialogComponent } from '@features/finance/treasury/cash-register/components/cash-register-close-dialog/cash-register-close-dialog.component';
import { CashRegisterActionDialogService } from '@core/layouts/services/cash-register-action-dialog.service';
import { CashRegisterActionDialogHostComponent } from '@features/finance/treasury/cash-register/components/cash-register-action-dialog-host/cash-register-action-dialog-host.component';

describe('CashRegisterActionDialogHostComponent', () => {
  let fixture: ComponentFixture<CashRegisterActionDialogHostComponent>;
  let component: CashRegisterActionDialogHostComponent;
  let actions: CashRegisterActionDialogService;
  let messages: { add: ReturnType<typeof vi.fn> };
  const router = { navigate: vi.fn(() => Promise.resolve(true)) };

  const activeClosure = signal<CashRegisterResponse | null>(null);
  const service = {
    activeClosure,
    loading: signal(false),
    currentUserName: signal('Cajero'),
    loadActiveClosure: vi.fn(() => of(activeClosure())),
    openRegister: vi.fn(() => of(null)),
    closeRegister: vi.fn(() => of(null)),
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
    activeClosure.set(null);
    messages = { add: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [CashRegisterActionDialogHostComponent],
      providers: [
        { provide: MessageService, useValue: messages },
        { provide: Router, useValue: router },
        { provide: CashRegisterApplicationService, useValue: service },
      ],
    })
      .overrideComponent(CashRegisterOpenDialogComponent, { set: { template: '', imports: [] } })
      .overrideComponent(CashRegisterCloseDialogComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(CashRegisterActionDialogHostComponent);
    component = fixture.componentInstance;
    actions = TestBed.inject(CashRegisterActionDialogService);
    fixture.detectChanges();
  });

  it('starts with every dialog hidden', () => {
    expect(component.openVisible()).toBe(false);
    expect(component.closeVisible()).toBe(false);
  });

  it('opens the open dialog when there is no active closure', () => {
    actions.open({ action: 'open' });
    fixture.detectChanges();

    expect(component.openVisible()).toBe(true);
    expect(component.closeVisible()).toBe(false);
    expect(service.loadActiveClosure).toHaveBeenCalled();
    expect(messages.add).not.toHaveBeenCalled();
  });

  it('opens the close dialog when the closure is open', () => {
    activeClosure.set(createClosure());
    actions.open({ action: 'close' });
    fixture.detectChanges();

    expect(component.closeVisible()).toBe(true);
    expect(component.openVisible()).toBe(false);
    expect(messages.add).not.toHaveBeenCalled();
  });

  it('navigates to the cash register page when details are requested', () => {
    activeClosure.set(createClosure());
    actions.open({ action: 'detail' });
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/finance/treasury/cash-register']);
    expect(component.openVisible()).toBe(false);
    expect(actions.request()).toBeNull();
    expect(messages.add).not.toHaveBeenCalled();
  });

  it('informs and clears the request when the action is not eligible', () => {
    activeClosure.set(createClosure());
    actions.open({ action: 'open' });
    fixture.detectChanges();

    expect(component.openVisible()).toBe(false);
    expect(messages.add).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'Abrir caja',
      detail: 'Esta acción no está disponible en el estado actual.',
    });
    expect(actions.request()).toBeNull();
  });

  it('closes the request when the opened dialog hides', () => {
    actions.open({ action: 'close' });
    activeClosure.set(createClosure());
    fixture.detectChanges();

    component.onCloseClosed(false);
    fixture.detectChanges();

    expect(component.closeVisible()).toBe(false);
    expect(actions.request()).toBeNull();
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
