import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CashRegisterResponse } from '@features/finance/treasury/cash-register/models/interfaces/closure.interface';
import { CashRegisterPageComponent } from '@features/finance/treasury/cash-register/pages/cash-register-page/cash-register-page.component';
import { CashRegisterOpenDialogComponent } from '@features/finance/treasury/cash-register/components/cash-register-open-dialog/cash-register-open-dialog.component';
import { CashRegisterCloseDialogComponent } from '@features/finance/treasury/cash-register/components/cash-register-close-dialog/cash-register-close-dialog.component';
import { CashRegisterDetailDialogComponent } from '@features/finance/treasury/cash-register/components/cash-register-detail-dialog/cash-register-detail-dialog.component';
import { CashRegisterApplicationService } from '@features/finance/treasury/cash-register/services/application/cash-register-application.service';
import { ThemeService } from '@core/theme/components/theme-toggle/theme.service';

describe('CashRegisterPageComponent', () => {
  let fixture: ComponentFixture<CashRegisterPageComponent>;
  let component: CashRegisterPageComponent;
  const activeClosure = signal<CashRegisterResponse | null>(null);

  const service = {
    activeClosure,
    loading: signal(false),
    currentUserName: signal('Cajero'),
    loadActiveClosure: vi.fn(() => of(null)),
    openRegister: vi.fn(() => of(null)),
    closeRegister: vi.fn(() => of(null)),
  };

  beforeEach(async () => {
    activeClosure.set(null);
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [CashRegisterPageComponent],
      providers: [
        { provide: AuthorizationService, useValue: { can: () => true } },
        { provide: ThemeService, useValue: { isDarkMode: signal(false) } },
        provideRouter([]),
        { provide: CashRegisterApplicationService, useValue: service },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CashRegisterPageComponent);
    component = fixture.componentInstance;
  });

  it('does not offer manual movement registration and groups session options in Actions', () => {
    activeClosure.set(createClosure());
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    const actionsButton = Array.from<Element>(
      fixture.nativeElement.querySelectorAll('p-button'),
    ).find((button) => button.textContent?.includes('Acciones'));
    expect(text).not.toContain('Registrar movimiento');
    expect(actionsButton).toBeDefined();
    expect(text).toContain('Facturación');
  });

  it('delegates the detail dialog to the shared dialog component', () => {
    activeClosure.set(createClosure());
    fixture.detectChanges();

    component.onOpenDetailDialog();
    fixture.detectChanges();

    const detail = fixture.debugElement.query(By.directive(CashRegisterDetailDialogComponent));
    expect(detail.componentInstance.visible()).toBe(true);
    expect(document.body.textContent).toContain('Sin movimientos');
    expect(document.body.textContent).toContain('Esta sesión todavía no tiene operaciones');
  });

  it('delegates the open and close dialogs to the shared dialog components', () => {
    activeClosure.set(createClosure());
    fixture.detectChanges();

    component.onOpenDialogOpen();
    component.onOpenCloseDialog();
    fixture.detectChanges();

    const open = fixture.debugElement.query(By.directive(CashRegisterOpenDialogComponent));
    const close = fixture.debugElement.query(By.directive(CashRegisterCloseDialogComponent));
    expect(open.componentInstance.visible()).toBe(true);
    expect(close.componentInstance.visible()).toBe(true);
    expect(component.openDialogVisible()).toBe(true);
    expect(component.closeDialogVisible()).toBe(true);
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
