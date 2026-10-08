import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AssignWarehousesDialogComponent } from '@features/orders/components/assign-warehouses-dialog/assign-warehouses-dialog.component';

@Component({
  template: `<app-assign-warehouses-dialog
    [visible]="visible"
    [orderId]="orderId"
    (confirmed)="onConfirmed($event)"
    (finished)="onFinished()"
    (cancelled)="onCancelled()"
  ></app-assign-warehouses-dialog>`,
  imports: [AssignWarehousesDialogComponent],
})
class HostComponent {
  visible = false;
  orderId: string | null = null;
  onConfirmed = vi.fn();
  onFinished = vi.fn();
  onCancelled = vi.fn();
}

const apiOrderResponse = {
  id: 'q-001',
  orderNumber: 'ORD-001',
  customerId: 'c1',
  customerName: 'Test Customer',
  customerRif: 'J-12345678-9',
  createdBy: 'u1',
  createdByName: 'Admin',
  status: 'DRAFT',
  deliveryDate: '2025-02-01',
  notes: null,
  subtotal: 1500,
  invoiceId: null,
  invoiceNumber: null,
  cancelledAt: null,
  cancelledReason: null,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  creditLimit: 0,
  availableCredit: 0,
  lines: [
    {
      id: 'line-001',
      productId: 'p1',
      productName: 'Motor 10HP',
      productCode: 'MOT-10',
      quantity: 5,
      unitPrice: 300,
      subtotal: 1500,
      allocated: false,
      allocations: [],
      warehouseStocks: [
        { warehouseId: 'wh-001', warehouseName: 'Central', available: 50 },
        { warehouseId: 'wh-002', warehouseName: 'Norte', available: 30 },
      ],
    },
  ],
};

describe('AssignWarehousesDialogComponent', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialog: AssignWarehousesDialogComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    dialog = fixture.debugElement.children[0].componentInstance;
  });

  it('should create', () => expect(dialog).toBeTruthy());
  it('should have default visible input as false', () => expect(dialog.visible()).toBe(false));
  it('should have default orderId input as null', () => expect(dialog.orderId()).toBeNull());

  it('should emit cancelled on cancel', () => {
    dialog.onCancel();
    expect(hostComponent.onCancelled).toHaveBeenCalled();
  });

  it('should NOT submit when lines are empty', () => {
    dialog.onSubmit();
    expect(hostComponent.onConfirmed).not.toHaveBeenCalled();
    expect(hostComponent.onFinished).not.toHaveBeenCalled();
  });
});

describe('AssignWarehousesDialogComponent - visible with data', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialog: AssignWarehousesDialogComponent;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.visible = true;
    hostComponent.orderId = 'q-001';
    fixture.detectChanges();
    dialog = fixture.debugElement.children[0].componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  function flushOrder() {
    httpMock
      .expectOne((r) => r.url.includes('/q-001') && r.method === 'GET')
      .flush(apiOrderResponse);
  }

  it('should have visible input as true', () => expect(dialog.visible()).toBe(true));

  it('should load order when visible and orderId are set', () => {
    flushOrder();
    expect(dialog.loading()).toBe(false);
    expect(dialog.orderInfo()).toBeTruthy();
    expect(dialog.orderInfo()!.number).toBe('ORD-001');
    expect(dialog.lines()).toHaveLength(1);
  });

  it('should set error on order API failure', () => {
    httpMock
      .expectOne((r) => r.url.includes('/q-001') && r.method === 'GET')
      .error(new ProgressEvent('Network error'));
    expect(dialog.error()).toBeTruthy();
    expect(dialog.loading()).toBe(false);
  });

  it('should build lines with zero assigned and canConfirm false', () => {
    flushOrder();
    const line = dialog.lines()[0];
    expect(line.quantity).toBe(5);
    expect(line.totalAssigned).toBe(0);
    expect(line.complete).toBe(false);
    expect(dialog.canConfirm()).toBe(false);
  });

  it('should mark line complete when assigned matches quantity', () => {
    flushOrder();
    const line = dialog.lines()[0];
    line.warehouses[0].assigned = 3;
    line.warehouses[1].assigned = 2;
    dialog.onAssignedChange(line);
    expect(dialog.lines()[0].totalAssigned).toBe(5);
    expect(dialog.lines()[0].complete).toBe(true);
    expect(dialog.canConfirm()).toBe(true);
  });

  it('should call API and emit confirmed with confirm option', () => {
    flushOrder();
    dialog.conversionOption.set('confirm');
    const line = dialog.lines()[0];
    line.warehouses[0].assigned = 5;
    dialog.onAssignedChange(line);
    dialog.onSubmit();
    httpMock
      .expectOne((r) => r.url.includes('/allocations') && r.method === 'PUT')
      .flush(apiOrderResponse);
    expect(hostComponent.onConfirmed).toHaveBeenCalledWith('q-001');
  });

  it('should call API and emit finished without conversion', () => {
    flushOrder();
    const line = dialog.lines()[0];
    line.warehouses[0].assigned = 5;
    dialog.onAssignedChange(line);
    dialog.onSubmit();
    httpMock
      .expectOne((r) => r.url.includes('/allocations') && r.method === 'PUT')
      .flush(apiOrderResponse);
    expect(hostComponent.onFinished).toHaveBeenCalled();
  });
});
