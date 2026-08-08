import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AssignWarehousesDialogComponent } from './assign-warehouses-dialog.component';

@Component({
  template: `<app-assign-warehouses-dialog [visible]="visible" [quoteId]="quoteId" (convertToOrder)="onConvertToOrder($event)" (convertToInvoice)="onConvertToInvoice($event)" (finished)="onFinished()" (cancelled)="onCancelled()"></app-assign-warehouses-dialog>`,
  imports: [AssignWarehousesDialogComponent],
})
class HostComponent {
  visible = false;
  quoteId: string | null = null;
  onConvertToOrder = vi.fn();
  onConvertToInvoice = vi.fn();
  onFinished = vi.fn();
  onCancelled = vi.fn();
}

describe('AssignWarehousesDialogComponent', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialog: AssignWarehousesDialogComponent;
  let httpMock: HttpTestingController;

  const mockQuote = {
    id: 'q-001',
    quoteNumber: 'QT-001',
    customerId: 'c1',
    customerName: 'Test Customer',
    customerRif: 'J-12345678-9',
    createdBy: 'u1',
    createdByName: 'Admin',
    status: 'CUSTOMER_DRAFT' as any,
    notes: null,
    subtotal: 1500,
    lines: [
      {
        id: 'line-001',
        productId: 'p1',
        productName: 'Motor 10HP',
        productCode: 'MOT-10',
        quantity: 5,
        unitPrice: 300,
        subtotal: 1500,
        allocations: [],
        warehouseStocks: [
          { warehouseId: 'wh-001', warehouseName: 'Central', available: 50 },
        ],
      },
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  const mockWarehouses = [
    { id: 'wh-001', name: 'Central', address: 'Main St' },
    { id: 'wh-002', name: 'Norte', address: '2nd Ave' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    dialog = fixture.debugElement.children[0].componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create', () => {
    expect(dialog).toBeTruthy();
  });

  it('should have default visible input as false', () => {
    expect(dialog.visible()).toBe(false);
  });

  it('should have default quoteId input as null', () => {
    expect(dialog.quoteId()).toBeNull();
  });

  it('should emit cancelled on cancel', () => {
    dialog.onCancel();
    expect(hostComponent.onCancelled).toHaveBeenCalled();
  });

  it('should NOT submit when lines are empty', () => {
    dialog.onConfirm();
    expect(hostComponent.onConvertToOrder).not.toHaveBeenCalled();
    expect(hostComponent.onFinished).not.toHaveBeenCalled();
  });
});

describe('AssignWarehousesDialogComponent - visible with data', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialog: AssignWarehousesDialogComponent;
  let httpMock: HttpTestingController;

  const mockQuote = {
    id: 'q-001',
    quoteNumber: 'QT-001',
    customerId: 'c1',
    customerName: 'Test Customer',
    customerRif: 'J-12345678-9',
    createdBy: 'u1',
    createdByName: 'Admin',
    status: 'CUSTOMER_DRAFT' as any,
    notes: null,
    subtotal: 1500,
    lines: [
      {
        id: 'line-001',
        productId: 'p1',
        productName: 'Motor 10HP',
        productCode: 'MOT-10',
        quantity: 5,
        unitPrice: 300,
        subtotal: 1500,
        allocations: [],
        warehouseStocks: [
          { warehouseId: 'wh-001', warehouseName: 'Central', available: 50 },
        ],
      },
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  const mockWarehouses = [
    { id: 'wh-001', name: 'Central', address: 'Main St' },
    { id: 'wh-002', name: 'Norte', address: '2nd Ave' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.visible = true;
    hostComponent.quoteId = 'q-001';
    fixture.detectChanges();
    dialog = fixture.debugElement.children[0].componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should have visible input as true', () => {
    expect(dialog.visible()).toBe(true);
  });

  it('should load quote and warehouses when visible and quoteId are set', () => {
    const quoteReq = httpMock.expectOne((r) => r.url.includes('/q-001') && r.method === 'GET');
    quoteReq.flush(mockQuote);

    const whReq = httpMock.expectOne((r) => r.url.includes('/warehouses') && r.method === 'GET');
    whReq.flush(mockWarehouses);

    expect(dialog.loading()).toBe(false);
    expect(dialog.quoteInfo()).toEqual({
      number: 'QT-001',
      customerName: 'Test Customer',
      subtotal: 1500,
      isCustomerDraft: true,
    });
    expect(dialog.lines()).toHaveLength(1);
    expect(dialog.lines()[0].warehouses).toHaveLength(2);
  });

  it('should set error on quote API failure', () => {
    const quoteReq = httpMock.expectOne((r) => r.url.includes('/q-001') && r.method === 'GET');
    quoteReq.error(new ProgressEvent('Network error'));

    expect(dialog.error()).toBeTruthy();
    expect(dialog.loading()).toBe(false);
  });

  it('should set error on warehouses API failure', () => {
    const quoteReq = httpMock.expectOne((r) => r.url.includes('/q-001') && r.method === 'GET');
    quoteReq.flush(mockQuote);

    const whReq = httpMock.expectOne((r) => r.url.includes('/warehouses') && r.method === 'GET');
    whReq.error(new ProgressEvent('Network error'));

    expect(dialog.error()).toBeTruthy();
    expect(dialog.loading()).toBe(false);
  });

  it('should build lines with zero assigned and canConfirm false until complete', () => {
    const quoteReq = httpMock.expectOne((r) => r.url.includes('/q-001') && r.method === 'GET');
    quoteReq.flush(mockQuote);
    const whReq = httpMock.expectOne((r) => r.url.includes('/warehouses') && r.method === 'GET');
    whReq.flush(mockWarehouses);

    const line = dialog.lines()[0];
    expect(line.quantity).toBe(5);
    expect(line.totalAssigned).toBe(0);
    expect(line.complete).toBe(false);
    expect(dialog.canConfirm()).toBe(false);
  });

  it('should mark line complete when assigned total matches quantity', () => {
    const quoteReq = httpMock.expectOne((r) => r.url.includes('/q-001') && r.method === 'GET');
    quoteReq.flush(mockQuote);
    const whReq = httpMock.expectOne((r) => r.url.includes('/warehouses') && r.method === 'GET');
    whReq.flush(mockWarehouses);

    const line = dialog.lines()[0];
    line.warehouses[0].assigned = 3;
    line.warehouses[1].assigned = 2;
    dialog.onAssignedChange(line);

    expect(dialog.lines()[0].totalAssigned).toBe(5);
    expect(dialog.lines()[0].complete).toBe(true);
    expect(dialog.canConfirm()).toBe(true);
  });

  it('should call API and emit finished when submitted without conversion', () => {
    const quoteReq = httpMock.expectOne((r) => r.url.includes('/q-001') && r.method === 'GET');
    quoteReq.flush(mockQuote);
    const whReq = httpMock.expectOne((r) => r.url.includes('/warehouses') && r.method === 'GET');
    whReq.flush(mockWarehouses);

    const line = dialog.lines()[0];
    line.warehouses[0].assigned = 5;
    dialog.onAssignedChange(line);
    dialog.onConfirm();

    const assignReq = httpMock.expectOne((r) => r.url.includes('/allocations') && r.method === 'PUT');
    assignReq.flush(mockQuote);

    expect(hostComponent.onFinished).toHaveBeenCalled();
  });

  it('should call API and emit convertToOrder when submitted with order conversion', () => {
    const quoteReq = httpMock.expectOne((r) => r.url.includes('/q-001') && r.method === 'GET');
    quoteReq.flush(mockQuote);
    const whReq = httpMock.expectOne((r) => r.url.includes('/warehouses') && r.method === 'GET');
    whReq.flush(mockWarehouses);

    dialog.conversionOption.set('order');
    const line = dialog.lines()[0];
    line.warehouses[0].assigned = 5;
    dialog.onAssignedChange(line);
    dialog.onConfirm();

    const assignReq = httpMock.expectOne((r) => r.url.includes('/allocations') && r.method === 'PUT');
    assignReq.flush(mockQuote);

    expect(hostComponent.onConvertToOrder).toHaveBeenCalledWith('q-001');
  });
});
