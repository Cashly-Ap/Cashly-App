import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { PaymentAllocationFormComponent } from './payment-allocation-form.component';

describe('PaymentAllocationFormComponent', () => {
  let component: PaymentAllocationFormComponent;
  let fixture: ComponentFixture<PaymentAllocationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentAllocationFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentAllocationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty allocations', () => {
    expect(component.allocationsArray.length).toBe(0);
  });

  it('should calculate total allocated correctly', () => {
    expect(component.totalAllocated()).toBe(0);
  });

  it('should calculate remaining to allocate', () => {
    component.paymentAmount.set(100);
    expect(component.remainingToAllocate()).toBe(100);
  });
});
