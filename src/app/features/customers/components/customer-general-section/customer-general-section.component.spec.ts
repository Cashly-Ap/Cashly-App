import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CustomerGeneralSectionComponent } from './customer-general-section.component';
import { CustomerType, PaymentType } from '@features/customers/models/enums';

describe('CustomerGeneralSectionComponent', () => {
  let fixture: ComponentFixture<CustomerGeneralSectionComponent>;
  let component: CustomerGeneralSectionComponent;
  let fb: FormBuilder;
  let form: FormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerGeneralSectionComponent, ReactiveFormsModule, NoopAnimationsModule],
    }).compileComponents();

    fb = TestBed.inject(FormBuilder);
    form = fb.group({
      legalName: ['', Validators.required],
      rif: ['', Validators.required],
      alias: ['', Validators.required],
      type: [CustomerType.BUSINESS, Validators.required],
      paymentType: [PaymentType.CASH, Validators.required],
      creditDays: [{ value: 0, disabled: true }],
      creditLimit: [{ value: 0, disabled: true }],
      active: [true],
    });

    fixture = TestBed.createComponent(CustomerGeneralSectionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('form', form);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose form control by name', () => {
    const ctrl = component.control('legalName');
    expect(ctrl).toBeTruthy();
    expect(ctrl.value).toBe('');
  });

  it('should expose customer types', () => {
    expect(component.customerTypes.length).toBeGreaterThan(0);
  });

  it('should expose payment types', () => {
    expect(component.paymentTypes.length).toBe(2);
  });

  it('should disable credit fields when payment type is CASH', () => {
    form.get('paymentType')?.setValue(PaymentType.CASH);
    expect(form.get('creditDays')?.disabled).toBe(true);
    expect(form.get('creditLimit')?.disabled).toBe(true);
  });

  it('should enable credit fields when payment type is CREDIT', () => {
    form.get('paymentType')?.setValue(PaymentType.CREDIT);
    expect(form.get('creditDays')?.enabled).toBe(true);
    expect(form.get('creditLimit')?.enabled).toBe(true);
  });
});
