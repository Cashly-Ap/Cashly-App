import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { ConvertToInvoiceDialogComponent } from './convert-to-invoice-dialog.component';
import { PaymentType } from '@features/invoices/models/enums/payment-type.enum';

@Component({
  template: `<app-convert-to-invoice-dialog [visible]="visible" [orderNumber]="orderNumber" [customerName]="customerName" [totalAmount]="totalAmount" (confirmed)="onConfirmed($event)" (cancelled)="onCancelled()"></app-convert-to-invoice-dialog>`,
  imports: [ConvertToInvoiceDialogComponent],
})
class HostComponent {
  visible = false;
  orderNumber = '';
  customerName = '';
  totalAmount = 0;
  onConfirmed = vi.fn();
  onCancelled = vi.fn();
}

describe('ConvertToInvoiceDialogComponent', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialog: ConvertToInvoiceDialogComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    dialog = fixture.debugElement.children[0].componentInstance;
  });

  it('should create', () => {
    expect(dialog).toBeTruthy();
  });

  it('should have default visible input as false', () => {
    expect(dialog.visible()).toBe(false);
  });

  it('should have default orderNumber input as empty string', () => {
    expect(dialog.orderNumber()).toBe('');
  });

  it('should have default customerName input as empty string', () => {
    expect(dialog.customerName()).toBe('');
  });

  it('should have default totalAmount input as 0', () => {
    expect(dialog.totalAmount()).toBe(0);
  });

  it('should have default paymentType as CASH', () => {
    expect(dialog.paymentType()).toBe(PaymentType.CASH);
  });

  it('should have paymentTypeOptions with all payment types', () => {
    const values = dialog.paymentTypeOptions.map((o) => o.value);
    expect(values).toContain(PaymentType.CASH);
    expect(values).toContain(PaymentType.CREDIT);
  });

  it('should emit paymentType on confirm', () => {
    dialog.paymentType.set(PaymentType.CREDIT);
    dialog.onConfirm();
    expect(hostComponent.onConfirmed).toHaveBeenCalledWith(PaymentType.CREDIT);
  });

  it('should emit cancelled on cancel', () => {
    dialog.onCancel();
    expect(hostComponent.onCancelled).toHaveBeenCalled();
  });
});

describe('ConvertToInvoiceDialogComponent - visible', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialog: ConvertToInvoiceDialogComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.visible = true;
    hostComponent.orderNumber = 'ORD-001';
    hostComponent.customerName = 'Test Customer';
    hostComponent.totalAmount = 1250.5;
    fixture.detectChanges();
    dialog = fixture.debugElement.children[0].componentInstance;
  });

  it('should have visible input as true', () => {
    expect(dialog.visible()).toBe(true);
  });

  it('should have orderNumber input set', () => {
    expect(dialog.orderNumber()).toBe('ORD-001');
  });

  it('should have customerName input set', () => {
    expect(dialog.customerName()).toBe('Test Customer');
  });

  it('should have totalAmount input set', () => {
    expect(dialog.totalAmount()).toBe(1250.5);
  });

  it('should emit CASH when paymentType not changed', () => {
    dialog.onConfirm();
    expect(hostComponent.onConfirmed).toHaveBeenCalledWith(PaymentType.CASH);
  });

  it('should allow changing paymentType before confirm', () => {
    dialog.paymentType.set(PaymentType.CREDIT);
    dialog.onConfirm();
    expect(hostComponent.onConfirmed).toHaveBeenCalledWith(PaymentType.CREDIT);
  });
});
