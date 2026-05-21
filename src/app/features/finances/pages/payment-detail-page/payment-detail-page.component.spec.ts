import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { PaymentDetailPageComponent } from './payment-detail-page.component';

describe('PaymentDetailPageComponent', () => {
  let component: PaymentDetailPageComponent;
  let fixture: ComponentFixture<PaymentDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentDetailPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct status label', () => {
    const label = component.getStatusLabel('APPLIED' as any);
    expect(label).toBe('Aplicado');
  });

  it('should return correct type label', () => {
    const label = component.getPaymentTypeLabel('ADVANCE' as any);
    expect(label).toBe('Anticipo');
  });

  it('should return correct status variant', () => {
    expect(component.getStatusVariant('DRAFT' as any)).toBe('label');
    expect(component.getStatusVariant('APPLIED' as any)).toBe('success');
    expect(component.getStatusVariant('PARTIALLY_APPLIED' as any)).toBe('info');
    expect(component.getStatusVariant('CANCELLED' as any)).toBe('danger');
  });

  it('should allow cancel for applicable statuses', () => {
    expect(component.canCancel('APPLIED' as any)).toBe(true);
    expect(component.canCancel('PARTIALLY_APPLIED' as any)).toBe(true);
    expect(component.canCancel('DRAFT' as any)).toBe(false);
    expect(component.canCancel('CANCELLED' as any)).toBe(false);
  });
});
