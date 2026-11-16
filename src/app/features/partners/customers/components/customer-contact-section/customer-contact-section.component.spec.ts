import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CustomerContactSectionComponent } from '@features/partners/customers/components/customer-contact-section/customer-contact-section.component';

describe('CustomerContactSectionComponent', () => {
  let fixture: ComponentFixture<CustomerContactSectionComponent>;
  let component: CustomerContactSectionComponent;
  let fb: FormBuilder;
  let form: FormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerContactSectionComponent, ReactiveFormsModule, NoopAnimationsModule],
    }).compileComponents();

    fb = TestBed.inject(FormBuilder);
    form = fb.group({
      emails: fb.array([]),
      phones: fb.array([]),
    });

    fixture = TestBed.createComponent(CustomerContactSectionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('form', form);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose emailsArray', () => {
    expect(component.emailsArray).toBeInstanceOf(FormArray);
  });

  it('should expose phonesArray', () => {
    expect(component.phonesArray).toBeInstanceOf(FormArray);
  });

  it('should add email control', () => {
    expect(component.emailsArray.length).toBe(0);
    component.addEmail();
    expect(component.emailsArray.length).toBe(1);
  });

  it('should remove email control', () => {
    component.addEmail();
    component.addEmail();
    component.removeEmail(0);
    expect(component.emailsArray.length).toBe(1);
  });

  it('should add phone control', () => {
    expect(component.phonesArray.length).toBe(0);
    component.addPhone();
    expect(component.phonesArray.length).toBe(1);
  });

  it('should remove phone control', () => {
    component.addPhone();
    component.addPhone();
    component.removePhone(1);
    expect(component.phonesArray.length).toBe(1);
  });
});
