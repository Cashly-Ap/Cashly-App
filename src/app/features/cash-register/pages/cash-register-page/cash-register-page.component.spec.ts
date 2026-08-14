import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CashRegisterResponse } from '@features/cash-register/models/interfaces/closure.interface';
import { CashRegisterPageComponent } from './cash-register-page.component';
import { CashRegisterApplicationService } from '../../services/application/cash-register-application.service';

describe('CashRegisterPageComponent', () => {
  let fixture: ComponentFixture<CashRegisterPageComponent>;
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
        provideRouter([]),
        { provide: CashRegisterApplicationService, useValue: service },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CashRegisterPageComponent);
  });

  it('does not offer manual movement registration and groups session options in Actions', () => {
    activeClosure.set(createClosure());
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).not.toContain('Registrar movimiento');
    expect(fixture.nativeElement.querySelector('p-button[label="Acciones"]')).not.toBeNull();
    expect(text).toContain('Facturación');
  });

  it('shows an empty state when session details have no payment data', () => {
    activeClosure.set(createClosure());
    fixture.detectChanges();
    fixture.componentInstance.onOpenDetailDialog();
    fixture.detectChanges();

    expect(document.body.textContent).toContain('Sin movimientos');
    expect(document.body.textContent).toContain('Esta sesión todavía no tiene operaciones');
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
