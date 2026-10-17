import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { CancelOrderDialogComponent } from '@features/orders/components/cancel-order-dialog/cancel-order-dialog.component';
import { OrderList } from '@features/orders/models/interfaces/order-list.interface';
import { OrderStatus } from '@features/orders/models/enums/order-status.enum';

@Component({
  template: `<app-cancel-order-dialog
    [visible]="visible"
    [order]="order"
    (confirmed)="onConfirmed($event)"
    (cancelled)="onCancelled()"
  ></app-cancel-order-dialog>`,
  imports: [CancelOrderDialogComponent],
})
class HostComponent {
  visible = false;
  order: OrderList | null = null;
  onConfirmed = vi.fn();
  onCancelled = vi.fn();
}

describe('CancelOrderDialogComponent', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialog: CancelOrderDialogComponent;

  const mockOrder: OrderList = {
    id: 'ord-001',
    orderNumber: 'ORD-001',
    customerAlias: 'Test Customer',
    customerId: 'c1',
    status: OrderStatus.PENDING,
    totalAmount: 500,
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

  it('should have default order input as null', () => {
    expect(dialog.order()).toBeNull();
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

  it('should not emit confirmed when order is null', () => {
    dialog.form.get('reason')?.setValue('Test reason');
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

  it('should reset form when visible is false via ngOnChanges', () => {
    dialog.form.get('reason')?.setValue('Test reason');
    dialog.form.get('reason')?.markAsTouched();
    dialog.ngOnChanges();
    expect(dialog.form.get('reason')?.value).toBeNull();
    expect(dialog.form.get('reason')?.touched).toBe(false);
  });
});

describe('CancelOrderDialogComponent - visible', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialog: CancelOrderDialogComponent;

  const mockOrder: OrderList = {
    id: 'ord-001',
    orderNumber: 'ORD-001',
    customerAlias: 'Test Customer',
    customerId: 'c1',
    status: OrderStatus.PENDING,
    totalAmount: 500,
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
    hostComponent.order = mockOrder;
    fixture.detectChanges();
    dialog = fixture.debugElement.children[0].componentInstance;
  });

  it('should have visible input as true', () => {
    expect(dialog.visible()).toBe(true);
  });

  it('should have order input set', () => {
    expect(dialog.order()?.id).toBe('ord-001');
  });

  it('should emit confirmed with orderId and reason when valid', () => {
    dialog.form.get('reason')?.setValue('Customer requested cancellation');
    dialog.onConfirm();
    expect(hostComponent.onConfirmed).toHaveBeenCalledWith({
      orderId: 'ord-001',
      reason: 'Customer requested cancellation',
    });
  });

  it('should trim reason before emitting', () => {
    dialog.form.get('reason')?.setValue('  Trimmed reason  ');
    dialog.onConfirm();
    expect(hostComponent.onConfirmed).toHaveBeenCalledWith({
      orderId: 'ord-001',
      reason: 'Trimmed reason',
    });
  });

  it('should mark form as touched when invalid on confirm', () => {
    dialog.onConfirm();
    expect(dialog.form.get('reason')?.touched).toBe(true);
  });
});
