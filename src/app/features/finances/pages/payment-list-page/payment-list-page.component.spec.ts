import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { PaymentListPageComponent } from './payment-list-page.component';

describe('PaymentListPageComponent', () => {
  let component: PaymentListPageComponent;
  let fixture: ComponentFixture<PaymentListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentListPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.searchTerm()).toBe('');
    expect(component.first()).toBe(0);
    expect(component.rows()).toBe(10);
    expect(component.selectedStatus()).toBe('');
    expect(component.filterType()).toBe('');
  });

  it('should have status options', () => {
    expect(component.statusOptions.length).toBeGreaterThan(1);
    expect(component.statusOptions[0].value).toBe('');
  });

  it('should have type options', () => {
    expect(component.typeOptions.length).toBeGreaterThan(1);
    expect(component.typeOptions[0].value).toBe('');
  });

  it('should calculate activeFilterCount correctly', () => {
    expect(component.activeFilterCount()).toBe(0);
    component.selectedStatus.set('DRAFT');
    expect(component.activeFilterCount()).toBe(1);
  });

  it('should return correct status label', () => {
    const label = component.getStatusLabel('DRAFT' as any);
    expect(label).toBe('Borrador');
  });

  it('should return correct type label', () => {
    const label = component.getPaymentTypeLabel('PAYMENT' as any);
    expect(label).toBe('Pago');
  });

  it('should return correct status variant', () => {
    expect(component.getStatusVariant('APPLIED' as any)).toBe('success');
    expect(component.getStatusVariant('CANCELLED' as any)).toBe('danger');
  });

  it('should allow cancel for non-draft and non-cancelled', () => {
    expect(component.canCancel('APPLIED' as any)).toBe(true);
    expect(component.canCancel('PARTIALLY_APPLIED' as any)).toBe(true);
    expect(component.canCancel('DRAFT' as any)).toBe(false);
    expect(component.canCancel('CANCELLED' as any)).toBe(false);
  });
});
