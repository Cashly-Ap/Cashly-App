import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { ConvertToInvoiceDialogComponent } from '@features/orders/components/convert-to-invoice-dialog/convert-to-invoice-dialog.component';
import { PaymentType } from '@features/finance/billing/invoices/models/enums/payment-type.enum';

@Component({
  template: `<app-convert-to-invoice-dialog
    [visible]="visible"
    [orderNumber]="orderNumber"
    [customerName]="customerName"
    [totalAmount]="totalAmount"
    (confirmed)="onConfirmed($event)"
    (cancelled)="onCancelled()"
  ></app-convert-to-invoice-dialog>`,
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

  it('should have default paymentType as CASH', () => {
    expect(dialog.paymentType()).toBe(PaymentType.CASH);
  });

  it('should have paymentTypeOptions with all payment types', () => {
    const values = dialog.paymentTypeOptions.map((o) => o.value);
    expect(values).toContain(PaymentType.CASH);
    expect(values).toContain(PaymentType.CREDIT);
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

  it('should NOT emit when CASH and no payment lines and no balance', () => {
    dialog.paymentType.set(PaymentType.CASH);
    dialog.useBalance.set(false);
    dialog.paymentLines.set([]);
    dialog.onConfirm();
    expect(hostComponent.onConfirmed).not.toHaveBeenCalled();
  });

  it('should emit CASH with useBalance when balance covers total', () => {
    dialog.paymentType.set(PaymentType.CASH);
    dialog.useBalance.set(true);
    dialog.customerBalance.set(2000);
    dialog.onConfirm();
    expect(hostComponent.onConfirmed).toHaveBeenCalledWith({
      paymentType: PaymentType.CASH,
      useBalance: true,
      balanceAmount: 1250.5,
    });
  });

  it('should emit CASH with paymentMethodId from first payment line', () => {
    dialog.paymentType.set(PaymentType.CASH);
    dialog.useBalance.set(false);
    dialog.paymentLines.set([{ methodId: 'pm1', amount: 1250.5 }]);
    dialog.onConfirm();
    expect(hostComponent.onConfirmed).toHaveBeenCalledWith({
      paymentType: PaymentType.CASH,
      useBalance: false,
      balanceAmount: 0,
      paymentMethodId: 'pm1',
    });
  });

  it('should emit CREDIT without password when credit is fine', () => {
    dialog.creditStatus.set({
      creditLimit: 5000,
      availableCredit: 5000,
      hasOverdue: false,
      canCreateCreditInvoice: true,
    });
    dialog.paymentType.set(PaymentType.CREDIT);
    dialog.onConfirm();
    expect(hostComponent.onConfirmed).toHaveBeenCalledWith({
      paymentType: PaymentType.CREDIT,
    });
  });

  it('should NOT emit CREDIT when credit warning exists and no password', () => {
    dialog.creditStatus.set({
      creditLimit: 500,
      availableCredit: 500,
      hasOverdue: false,
      canCreateCreditInvoice: true,
    });
    dialog.paymentType.set(PaymentType.CREDIT);
    dialog.onConfirm();
    expect(hostComponent.onConfirmed).not.toHaveBeenCalled();
  });

  it('should emit CREDIT with password when warning exists and password provided', () => {
    dialog.creditStatus.set({
      creditLimit: 500,
      availableCredit: 500,
      hasOverdue: false,
      canCreateCreditInvoice: true,
    });
    dialog.paymentType.set(PaymentType.CREDIT);
    dialog.confirmationPassword.set('mypassword');
    dialog.onConfirm();
    expect(hostComponent.onConfirmed).toHaveBeenCalledWith({
      paymentType: PaymentType.CREDIT,
      confirmationPassword: 'mypassword',
    });
  });
});
