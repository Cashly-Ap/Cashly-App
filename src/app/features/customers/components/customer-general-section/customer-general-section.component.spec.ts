import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, signal } from '@angular/core';
import { CustomerGeneralSectionComponent } from '@features/customers/components/customer-general-section/customer-general-section.component';
import { CustomerType } from '@features/customers/models/enums/customer-type.enum';
import { PaymentType } from '@features/customers/models/enums/payment-type.enum';

@Component({
  template: `<app-customer-general-section [form]="form" [isEditMode]="isEditMode()" />`,
  imports: [CustomerGeneralSectionComponent, ReactiveFormsModule],
})
class HostComponent {
  fb = new FormBuilder();
  isEditMode = signal(false);
  form = this.fb.group({
    legalName: ['', Validators.required],
    rif: ['', Validators.required],
    alias: ['', Validators.required],
    type: [CustomerType.BUSINESS, Validators.required],
    paymentType: [PaymentType.CASH, Validators.required],
    creditDays: [{ value: 0, disabled: true }],
    creditLimit: [{ value: 0, disabled: true }],
    active: [true],
    notes: [''],
  });
}

describe('CustomerGeneralSectionComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let component: CustomerGeneralSectionComponent;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
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
    host.form.get('paymentType')?.setValue(PaymentType.CASH);
    expect(host.form.get('creditDays')?.disabled).toBe(true);
    expect(host.form.get('creditLimit')?.disabled).toBe(true);
  });

  it('should enable credit fields when payment type is CREDIT', () => {
    host.form.get('paymentType')?.setValue(PaymentType.CREDIT);
    expect(host.form.get('creditDays')?.enabled).toBe(true);
    expect(host.form.get('creditLimit')?.enabled).toBe(true);
  });
});
