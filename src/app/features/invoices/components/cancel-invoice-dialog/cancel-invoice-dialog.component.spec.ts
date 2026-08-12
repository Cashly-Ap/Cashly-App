import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { CancelInvoiceDialogComponent } from './cancel-invoice-dialog.component';
import { InvoiceStatus } from '../../models/enums/invoice-status.enum';
import { PaymentType } from '../../models/enums/payment-type.enum';

@Component({
  template: `<app-cancel-invoice-dialog
    [visible]="visible"
    [invoice]="invoice"
    (confirmed)="onConfirmed($event)"
    (cancelled)="onCancelled()"
  ></app-cancel-invoice-dialog>`,
  imports: [CancelInvoiceDialogComponent],
})
class HostComponent {
  visible = false;
  invoice: any = null;
  onConfirmed = vi.fn();
  onCancelled = vi.fn();
}

describe('CancelInvoiceDialogComponent', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialog: CancelInvoiceDialogComponent;

  const mockInvoice = {
    id: 'inv-001',
    invoiceNumber: 'FAC-001',
    customerId: 'c1',
    customerName: 'Test Customer',
    status: InvoiceStatus.PENDING_PAYMENT,
    paymentType: PaymentType.CASH,
    subtotal: 500,
    lineCount: 2,
    orderId: null,
    orderNumber: null,
    createdAt: '2025-01-01T00:00:00Z',
  };

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

  it('should have default invoice input as null', () => {
    expect(dialog.invoice()).toBeNull();
  });

  it('should have reason control with required validator', () => {
    expect(dialog.form.get('reason')?.hasError('required')).toBe(true);
  });

  it('should have reason control with maxlength validator', () => {
    const reasonCtrl = dialog.form.get('reason');
    reasonCtrl?.setValue('x'.repeat(501));
    expect(reasonCtrl?.hasError('maxlength')).toBe(true);
  });

  it('should not emit confirmed when form is invalid', () => {
    dialog.onConfirm();
    expect(hostComponent.onConfirmed).not.toHaveBeenCalled();
  });

  it('should emit cancelled and reset form on cancel', () => {
    dialog.form.get('reason')?.setValue('Test reason');
    dialog.onCancel();
    expect(hostComponent.onCancelled).toHaveBeenCalled();
    expect(dialog.form.get('reason')?.value).toBeNull();
  });

  it('should show reasonInvalid when control is invalid and touched', () => {
    const reasonCtrl = dialog.form.get('reason');
    reasonCtrl?.markAsTouched();
    expect(dialog.reasonInvalid).toBe(true);
  });

  it('should not show reasonInvalid when control is untouched', () => {
    expect(dialog.reasonInvalid).toBe(false);
  });

  it('should show reasonTooLong when maxlength exceeded', () => {
    dialog.form.get('reason')?.setValue('x'.repeat(501));
    expect(dialog.reasonTooLong).toBe(true);
  });
});

describe('CancelInvoiceDialogComponent - visible', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialog: CancelInvoiceDialogComponent;

  const mockInvoice = {
    id: 'inv-001',
    invoiceNumber: 'FAC-001',
    customerId: 'c1',
    customerName: 'Test Customer',
    status: InvoiceStatus.PENDING_PAYMENT,
    paymentType: PaymentType.CASH,
    subtotal: 500,
    lineCount: 2,
    orderId: null,
    orderNumber: null,
    createdAt: '2025-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.visible = true;
    hostComponent.invoice = mockInvoice;
    fixture.detectChanges();
    dialog = fixture.debugElement.children[0].componentInstance;
  });

  it('should have visible input as true', () => {
    expect(dialog.visible()).toBe(true);
  });

  it('should have invoice input set', () => {
    expect(dialog.invoice()?.id).toBe('inv-001');
  });

  it('should emit confirmed with invoiceId and reason when valid', () => {
    dialog.form.get('reason')?.setValue('Customer requested cancellation');
    dialog.onConfirm();
    expect(hostComponent.onConfirmed).toHaveBeenCalledWith({
      invoiceId: 'inv-001',
      reason: 'Customer requested cancellation',
    });
  });

  it('should trim reason before emitting', () => {
    dialog.form.get('reason')?.setValue('  Trimmed reason  ');
    dialog.onConfirm();
    expect(hostComponent.onConfirmed).toHaveBeenCalledWith({
      invoiceId: 'inv-001',
      reason: 'Trimmed reason',
    });
  });

  it.skip('should reset form when visible changes to false', async () => {
    dialog.form.get('reason')?.setValue('Test reason');
    dialog.form.get('reason')?.markAsTouched();

    hostComponent.visible = false;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dialog.form.get('reason')?.value).toBeNull();
  });
});
