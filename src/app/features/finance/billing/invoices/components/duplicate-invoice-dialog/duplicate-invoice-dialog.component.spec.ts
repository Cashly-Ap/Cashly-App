import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { DuplicateInvoiceDialogComponent } from '@features/finance/billing/invoices/components/duplicate-invoice-dialog/duplicate-invoice-dialog.component';
import { InvoiceApiService } from '@features/finance/billing/invoices/services/api/invoice-api.service';
import { of, throwError } from 'rxjs';
import { InvoiceStatus } from '@features/finance/billing/invoices/models/enums/invoice-status.enum';
import { PaymentType } from '@features/finance/billing/invoices/models/enums/payment-type.enum';

@Component({
  template: `<app-duplicate-invoice-dialog
    [visible]="visible"
    [invoiceId]="invoiceId"
    (confirmed)="onConfirmed($event)"
    (cancelled)="onCancelled()"
  ></app-duplicate-invoice-dialog>`,
  imports: [DuplicateInvoiceDialogComponent],
})
class HostComponent {
  visible = false;
  invoiceId: string | null = null;
  onConfirmed = vi.fn();
  onCancelled = vi.fn();
}

describe('DuplicateInvoiceDialogComponent', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialog: DuplicateInvoiceDialogComponent;
  let mockApi: Partial<InvoiceApiService>;

  const mockInvoice = {
    id: 'inv-001',
    invoiceNumber: 'FAC-001',
    customerId: 'c1',
    customerName: 'Test Customer',
    customerRif: 'J-12345678-9',
    createdBy: 'user-001',
    createdByName: 'John Doe',
    orderId: null,
    orderNumber: null,
    status: InvoiceStatus.DRAFT,
    paymentType: PaymentType.CASH,
    notes: 'Test notes',
    subtotal: 500,
    cancelledAt: null,
    cancelledReason: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    lines: [
      {
        id: 'line-001',
        productId: 'p1',
        productName: 'Motor 10HP',
        productCode: 'MOT-10',
        quantity: 5,
        unitPrice: 100,
        lineTotal: 500,
        warehouseAllocations: [
          {
            id: 'alloc-001',
            warehouseId: 'wh-001',
            warehouseCode: 'WH1',
            warehouseName: 'Central',
            available: 50,
            allocated: 5,
          },
        ],
        warehouseStocks: [
          {
            warehouseId: 'wh-001',
            warehouseCode: 'WH1',
            warehouseName: 'Central',
            quantity: 50,
            reserved: 10,
            available: 40,
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    mockApi = {
      getById: vi.fn().mockReturnValue(of(mockInvoice)),
    };

    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: InvoiceApiService, useValue: mockApi }],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    dialog = fixture.debugElement.children[0].componentInstance;
  });

  it('should create', () => {
    expect(dialog).toBeTruthy();
  });

  it('should have default inputs as false/null', () => {
    expect(dialog.visible()).toBe(false);
    expect(dialog.invoiceId()).toBeNull();
  });

  it('should reset state when visible changes to false', async () => {
    dialog.lines.set([
      {
        productName: 'Test',
        productCode: 'T1',
        quantity: 1,
        allocations: [],
        hasNegativeStock: false,
      },
    ]);
    dialog.ngOnChanges();

    expect(dialog.lines()).toEqual([]);
    expect(dialog.invoiceInfo()).toBeNull();
    expect(dialog.error()).toBeNull();
    expect(dialog.hasAnyNegativeStock()).toBe(false);
    expect(dialog.selectedCustomer()).toBeNull();
  });

  it('should not emit confirmed when no invoiceId', () => {
    dialog.onConfirm();
    expect(hostComponent.onConfirmed).not.toHaveBeenCalled();
  });

  it('should emit cancelled on cancel', () => {
    dialog.onCancel();
    expect(hostComponent.onCancelled).toHaveBeenCalled();
  });
});

describe('DuplicateInvoiceDialogComponent - visible', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialog: DuplicateInvoiceDialogComponent;
  let mockApi: Partial<InvoiceApiService>;

  const mockInvoice = {
    id: 'inv-001',
    invoiceNumber: 'FAC-001',
    customerId: 'c1',
    customerName: 'Test Customer',
    customerRif: 'J-12345678-9',
    createdBy: 'user-001',
    createdByName: 'John Doe',
    orderId: null,
    orderNumber: null,
    status: InvoiceStatus.DRAFT,
    paymentType: PaymentType.CASH,
    notes: 'Test notes',
    subtotal: 500,
    cancelledAt: null,
    cancelledReason: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    lines: [
      {
        id: 'line-001',
        productId: 'p1',
        productName: 'Motor 10HP',
        productCode: 'MOT-10',
        quantity: 5,
        unitPrice: 100,
        lineTotal: 500,
        warehouseAllocations: [
          {
            id: 'alloc-001',
            warehouseId: 'wh-001',
            warehouseCode: 'WH1',
            warehouseName: 'Central',
            available: 50,
            allocated: 5,
          },
        ],
        warehouseStocks: [
          {
            warehouseId: 'wh-001',
            warehouseCode: 'WH1',
            warehouseName: 'Central',
            quantity: 50,
            reserved: 10,
            available: 40,
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    mockApi = {
      getById: vi.fn().mockReturnValue(of(mockInvoice)),
    };

    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: InvoiceApiService, useValue: mockApi }],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.visible = true;
    hostComponent.invoiceId = 'inv-001';
    fixture.detectChanges();
    dialog = fixture.debugElement.children[0].componentInstance;
  });

  it('should load invoice data when visible and invoiceId are set', () => {
    expect(mockApi.getById).toHaveBeenCalledWith('inv-001');
  });

  it('should set invoiceInfo after loading', async () => {
    await fixture.whenStable();
    expect(dialog.invoiceInfo()).toEqual({
      number: 'FAC-001',
      customerName: 'Test Customer',
      customerRif: 'J-12345678-9',
    });
  });

  it('should set lines after loading', async () => {
    await fixture.whenStable();
    expect(dialog.lines()).toHaveLength(1);
    expect(dialog.lines()[0].productName).toBe('Motor 10HP');
  });

  it('should set error on load failure', async () => {
    mockApi.getById = vi.fn().mockReturnValue(throwError(() => new Error('Not found')));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: InvoiceApiService, useValue: mockApi }],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.visible = true;
    hostComponent.invoiceId = 'inv-001';
    fixture.detectChanges();
    dialog = fixture.debugElement.children[0].componentInstance;
    await fixture.whenStable();

    expect(dialog.error()).toBe('Not found');
  });

  it('should calculate realAvailable as available - allocated', async () => {
    await fixture.whenStable();
    const line = dialog.lines()[0];
    expect(line.allocations[0].realAvailable).toBe(35);
  });

  it('should set hasAnyNegativeStock when any allocation would be negative', async () => {
    const negativeInvoice = {
      ...mockInvoice,
      lines: [
        {
          ...mockInvoice.lines[0],
          warehouseAllocations: [
            {
              id: 'alloc-001',
              warehouseId: 'wh-001',
              warehouseCode: 'WH1',
              warehouseName: 'Central',
              available: 50,
              allocated: 30,
            },
          ],
          warehouseStocks: [
            {
              warehouseId: 'wh-001',
              warehouseCode: 'WH1',
              warehouseName: 'Central',
              quantity: 50,
              reserved: 10,
              available: 40,
            },
          ],
        },
      ],
    };

    mockApi.getById = vi.fn().mockReturnValue(of(negativeInvoice));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: InvoiceApiService, useValue: mockApi }],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.visible = true;
    hostComponent.invoiceId = 'inv-001';
    fixture.detectChanges();
    dialog = fixture.debugElement.children[0].componentInstance;
    await fixture.whenStable();

    expect(dialog.hasAnyNegativeStock()).toBe(true);
  });

  it('should emit confirmed with invoiceId and no customerId when valid', () => {
    dialog.hasAnyNegativeStock.set(false);
    dialog.onConfirm();
    expect(hostComponent.onConfirmed).toHaveBeenCalledWith({
      invoiceId: 'inv-001',
      customerId: undefined,
    });
  });

  it('should emit confirmed with selectedCustomer when customer was chosen', () => {
    dialog.selectedCustomer.set({
      id: 'new-customer-id',
      code: 200,
      alias: 'NewCo',
      legalName: 'New Customer SA',
      rif: 'J-22222222-2',
      type: 'BUSINESS',
      active: true,
    });
    dialog.hasAnyNegativeStock.set(false);
    dialog.onConfirm();
    expect(hostComponent.onConfirmed).toHaveBeenCalledWith({
      invoiceId: 'inv-001',
      customerId: 'new-customer-id',
    });
  });

  it('should not emit confirmed when has negative stock', () => {
    dialog.hasAnyNegativeStock.set(true);
    dialog.onConfirm();
    expect(hostComponent.onConfirmed).not.toHaveBeenCalled();
  });
});
