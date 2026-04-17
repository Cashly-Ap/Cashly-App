import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CustomerAddressesSectionComponent } from './customer-addresses-section.component';

describe('CustomerAddressesSectionComponent', () => {
  let fixture: ComponentFixture<CustomerAddressesSectionComponent>;
  let component: CustomerAddressesSectionComponent;
  let fb: FormBuilder;
  let form: FormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerAddressesSectionComponent, ReactiveFormsModule, NoopAnimationsModule],
    }).compileComponents();

    fb = TestBed.inject(FormBuilder);
    form = fb.group({
      addresses: fb.array([]),
    });

    fixture = TestBed.createComponent(CustomerAddressesSectionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('form', form);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose addressesArray', () => {
    expect(component.addressesArray).toBeInstanceOf(FormArray);
  });

  it('should add address group', () => {
    expect(component.addressesArray.length).toBe(0);
    component.addAddress();
    expect(component.addressesArray.length).toBe(1);
  });

  it('should add address with default values', () => {
    component.addAddress();
    const group = component.addressGroup(0);
    expect(group.get('address')?.value).toBe('');
    expect(group.get('billing')?.value).toBe(false);
    expect(group.get('active')?.value).toBe(true);
  });

  it('should remove address', () => {
    component.addAddress();
    component.addAddress();
    component.removeAddress(0);
    expect(component.addressesArray.length).toBe(1);
  });

  it('should uncheck other billing addresses when one is set as billing', () => {
    component.addAddress();
    component.addAddress();

    component.addressGroup(0).get('billing')?.setValue(true);
    component.addressGroup(1).get('billing')?.setValue(true);
    component.onBillingChange(1);

    expect(component.addressGroup(0).get('billing')?.value).toBe(false);
    expect(component.addressGroup(1).get('billing')?.value).toBe(true);
  });
});
