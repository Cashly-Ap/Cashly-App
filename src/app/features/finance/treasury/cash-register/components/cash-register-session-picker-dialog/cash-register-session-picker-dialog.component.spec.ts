import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CashRegisterSessionPickerDialogComponent } from '@features/finance/treasury/cash-register/components/cash-register-session-picker-dialog/cash-register-session-picker-dialog.component';
import { CashRegisterApplicationService } from '@features/finance/treasury/cash-register/services/application/cash-register-application.service';
import { CashRegisterResponse } from '@features/finance/treasury/cash-register/models/interfaces/closure.interface';

describe('CashRegisterSessionPickerDialogComponent', () => {
  let fixture: ComponentFixture<CashRegisterSessionPickerDialogComponent>;
  let component: CashRegisterSessionPickerDialogComponent;
  const history = signal<CashRegisterResponse[]>([createRegister()]);
  const service = {
    history,
    loading: signal(false),
    activeClosure: signal<CashRegisterResponse | null>(null),
    loadHistory: vi.fn(() => of(null)),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [CashRegisterSessionPickerDialogComponent],
      providers: [{ provide: CashRegisterApplicationService, useValue: service }],
    }).compileComponents();

    fixture = TestBed.createComponent(CashRegisterSessionPickerDialogComponent);
    component = fixture.componentInstance;
  });

  it('loads open and closed sessions when opened', () => {
    component.visible.set(true);
    fixture.detectChanges();

    expect(service.loadHistory).toHaveBeenCalledWith(
      0,
      50,
      undefined,
      undefined,
      'openedAt,desc',
      'SIMPLE',
    );
  });

  it('selects a session and only emits it after confirmation', () => {
    const emitted: string[] = [];
    component.selected.subscribe((id) => emitted.push(id));
    component.visible.set(true);
    fixture.detectChanges();

    component.onSelect(createRegister());
    expect(emitted).toEqual([]);
    expect(component.isSelected(createRegister())).toBe(true);

    component.onConfirm();

    expect(emitted).toEqual(['cash-1']);
    expect(component.visible()).toBe(false);
  });

  it('filters sessions by the search term', () => {
    component.visible.set(true);
    fixture.detectChanges();

    component.onSearchChange('nadie');

    expect(component.filteredSessions()).toEqual([]);
  });

  it('filters sessions by status without hitting the API again', () => {
    component.visible.set(true);
    fixture.detectChanges();
    service.loadHistory.mockClear();

    component.onStatusChange('CLOSED');

    expect(component.filteredSessions()).toEqual([]);
    expect(component.activeFilterCount()).toBe(1);
    expect(service.loadHistory).not.toHaveBeenCalled();
  });

  it('reloads history with the selected date range', () => {
    component.visible.set(true);
    fixture.detectChanges();
    service.loadHistory.mockClear();

    component.onDateFromChange(new Date(2026, 7, 1));

    expect(service.loadHistory).toHaveBeenCalledWith(
      0,
      50,
      '2026-08-01',
      undefined,
      'openedAt,desc',
      'SIMPLE',
    );
  });

  it('closes without emitting when cancelled', () => {
    const emitted: string[] = [];
    component.selected.subscribe((id) => emitted.push(id));
    component.visible.set(true);
    fixture.detectChanges();

    component.onCancel();

    expect(emitted).toEqual([]);
    expect(component.visible()).toBe(false);
  });
});

function createRegister(): CashRegisterResponse {
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
