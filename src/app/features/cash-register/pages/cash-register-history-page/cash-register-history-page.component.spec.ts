import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CashRegisterResponse } from '@features/cash-register/models/interfaces/closure.interface';
import { CashRegisterHistoryPageComponent } from './cash-register-history-page.component';
import { CashRegisterApplicationService } from '../../services/application/cash-register-application.service';

describe('CashRegisterHistoryPageComponent', () => {
  let fixture: ComponentFixture<CashRegisterHistoryPageComponent>;
  const history = signal<CashRegisterResponse[]>([]);
  const service = {
    history,
    loading: signal(false),
    totalElements: signal(1),
    loadHistory: vi.fn(() => of(null)),
  };

  beforeEach(async () => {
    history.set([createClosure()]);
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [CashRegisterHistoryPageComponent],
      providers: [
        provideRouter([]),
        { provide: CashRegisterApplicationService, useValue: service },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CashRegisterHistoryPageComponent);
  });

  it('does not show per-session report actions', () => {
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).not.toContain('Reportes');
    expect(fixture.nativeElement.querySelector('[icon="pi pi-file-pdf"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[icon="pi pi-file-excel"]')).toBeNull();
  });

  it('renders dedicated compact and desktop history layouts', () => {
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('[data-testid="cash-history-compact"]'),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-testid="cash-history-desktop"]'),
    ).not.toBeNull();
  });
});

function createClosure(): CashRegisterResponse {
  return {
    id: 'cash-1',
    closureDate: '2026-08-14',
    status: 'CLOSED',
    openedBy: 'user-1',
    openedByName: 'Cajero',
    openedAt: '2026-08-14T08:00:00Z',
    closedBy: 'user-1',
    closedByName: 'Cajero',
    closedAt: '2026-08-14T16:00:00Z',
    closingNotes: null,
    details: [],
    totalInvoiced: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    balance: 100,
    revenueSummary: [],
    expenseSummary: [],
    openingBalance: 100,
    totalIncome: 20,
    totalExpense: 10,
    expectedBalance: 110,
    declaredBalance: 110,
    difference: 0,
    movements: [],
  };
}
