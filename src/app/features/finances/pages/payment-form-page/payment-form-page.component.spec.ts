import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { PaymentFormPageComponent } from './payment-form-page.component';

describe('PaymentFormPageComponent', () => {
  let component: PaymentFormPageComponent;
  let fixture: ComponentFixture<PaymentFormPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentFormPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.isSubmitting()).toBe(false);
    expect(component.selectedCustomer()).toBeNull();
    expect(component.pickerVisible()).toBe(false);
  });

  it('should have type options', () => {
    expect(component.typeOptions.length).toBe(2);
  });

  it('should have payment method options', () => {
    expect(component.paymentMethodOptions.length).toBeGreaterThan(0);
  });

  it('should detect advance type correctly', () => {
    expect(component.isAdvanceType()).toBe(false);
    component.form.patchValue({ type: 'ADVANCE' });
    expect(component.isAdvanceType()).toBe(true);
  });

  it('should have required validators', () => {
    const customerId = component.form.get('customerId');
    const amount = component.form.get('amount');
    expect(customerId?.hasValidator).toBeTruthy();
    expect(amount?.hasValidator).toBeTruthy();
  });
});
