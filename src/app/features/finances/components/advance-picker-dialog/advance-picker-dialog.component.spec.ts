import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { AdvancePickerDialogComponent } from './advance-picker-dialog.component';

describe('AdvancePickerDialogComponent', () => {
  let component: AdvancePickerDialogComponent;
  let fixture: ComponentFixture<AdvancePickerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancePickerDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdvancePickerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return empty advance options when no advances', () => {
    component.advances.set([]);
    expect(component.advanceOptions()).toEqual([]);
  });

  it('should filter advances with remaining amount', () => {
    component.advances.set([
      { id: '1', paymentNumber: 'PAY-001', customerId: 'c1', customerName: 'Test', amount: 100, remainingAmount: 50, paymentDate: '2025-01-01', status: 'PARTIALLY_APPLIED' },
      { id: '2', paymentNumber: 'PAY-002', customerId: 'c1', customerName: 'Test', amount: 100, remainingAmount: 0, paymentDate: '2025-01-01', status: 'APPLIED' },
    ]);
    expect(component.advanceOptions().length).toBe(1);
  });

  it('should return correct status label', () => {
    const label = component.getStatusLabel('PARTIALLY_APPLIED' as any);
    expect(label).toBe('Parcialmente Aplicado');
  });
});
