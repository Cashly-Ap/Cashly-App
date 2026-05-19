import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA, Component, signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ConvertToInvoiceDialogComponent } from './convert-to-invoice-dialog.component';
import { QuoteApiService } from '@features/quotes/services/api/quote-api.service';
import { PaymentType } from '@features/invoices/models/enums/payment-type.enum';

@Component({
  template: `<app-convert-to-invoice-dialog [visible]="visible" [quoteId]="quoteId" (confirmed)="onConfirmed($event)" (cancelled)="onCancelled()"></app-convert-to-invoice-dialog>`,
  imports: [ConvertToInvoiceDialogComponent],
})
class HostComponent {
  visible = false;
  quoteId: string | null = null;
  onConfirmed = vi.fn();
  onCancelled = vi.fn();
}

describe('ConvertToInvoiceDialogComponent', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialog: ConvertToInvoiceDialogComponent;
  let httpMock: HttpTestingController;

  const mockQuote = {
    id: 'q-001',
    quoteNumber: 'QT-001',
    customerId: 'c1',
    customerName: 'Test Customer',
    customerRif: 'J-12345678-9',
    createdBy: 'u1',
    createdByName: 'Admin',
    status: 'DRAFT' as any,
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
        allocations: [
          { warehouseId: 'wh-001', warehouseName: 'Central', warehouseCode: 'WH1', allocatedQuantity: 5 },
        ],
        warehouseStocks: [
          { warehouseId: 'wh-001', warehouseName: 'Central', available: 50 },
        ],
      },
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

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

  it('should have default paymentType as CASH', () => {
    expect(dialog.paymentType()).toBe(PaymentType.CASH);
  });

  it('should have paymentTypeOptions with all payment types', () => {
    const values = dialog.paymentTypeOptions.map((o) => o.value);
    expect(values).toContain(PaymentType.CASH);
    expect(values).toContain(PaymentType.CREDIT);
  });

  it('should emit confirmed with paymentType on confirm', () => {
    dialog.paymentType.set(PaymentType.CREDIT);
    dialog.onConfirm();
    expect(hostComponent.onConfirmed).toHaveBeenCalledWith({ paymentType: PaymentType.CREDIT });
  });

  it('should emit cancelled on cancel', () => {
    dialog.onCancel();
    expect(hostComponent.onCancelled).toHaveBeenCalled();
  });

  it('should NOT emit confirmed when hasAnyNegativeStock is true', () => {
    dialog.hasAnyNegativeStock.set(true);
    dialog.onConfirm();
    expect(hostComponent.onConfirmed).not.toHaveBeenCalled();
  });
});

describe('ConvertToInvoiceDialogComponent - visible with data', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialog: ConvertToInvoiceDialogComponent;
  let httpMock: HttpTestingController;

  const mockQuote = {
    id: 'q-001',
    quoteNumber: 'QT-001',
    customerId: 'c1',
    customerName: 'Test Customer',
    customerRif: 'J-12345678-9',
    createdBy: 'u1',
    createdByName: 'Admin',
    status: 'DRAFT' as any,
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
        allocations: [
          { warehouseId: 'wh-001', warehouseName: 'Central', warehouseCode: 'WH1', allocatedQuantity: 5 },
        ],
        warehouseStocks: [
          { warehouseId: 'wh-001', warehouseName: 'Central', available: 50 },
        ],
      },
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

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

  it('should have quoteId input set', () => {
    expect(dialog.quoteId()).toBe('q-001');
  });

  it('should load quote data when visible and quoteId are set', () => {
    expect(dialog.loading()).toBe(true);

    const req = httpMock.expectOne((r) => r.url.includes('/q-001'));
    req.flush(mockQuote);

    expect(dialog.loading()).toBe(false);
    expect(dialog.quoteInfo()).toEqual({
      number: 'QT-001',
      customerName: 'Test Customer',
      subtotal: 1500,
    });
    expect(dialog.lines().length).toBe(1);
  });

  it('should set error on API failure', () => {
    const req = httpMock.expectOne((r) => r.url.includes('/q-001'));
    req.error(new ProgressEvent('Network error'));

    expect(dialog.error()).toBeTruthy();
    expect(dialog.loading()).toBe(false);
  });

  it('should detect negative stock when available < allocated', () => {
    const negativeQuote = {
      ...mockQuote,
      lines: [
        {
          ...mockQuote.lines[0],
          warehouseStocks: [
            { warehouseId: 'wh-001', warehouseName: 'Central', available: 2 },
          ],
        },
      ],
    };

    const req = httpMock.expectOne((r) => r.url.includes('/q-001'));
    req.flush(negativeQuote);

    expect(dialog.hasAnyNegativeStock()).toBe(true);
    expect(dialog.lines()[0].hasNegativeStock).toBe(true);
  });

  it('should reset state when dialog is closed', async () => {
    const req = httpMock.expectOne((r) => r.url.includes('/q-001'));
    req.flush(mockQuote);

    expect(dialog.lines().length).toBe(1);

    hostComponent.visible = false;
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    expect(dialog.lines()).toEqual([]);
    expect(dialog.quoteInfo()).toBeNull();
    expect(dialog.error()).toBeNull();
    expect(dialog.hasAnyNegativeStock()).toBe(false);
    expect(dialog.paymentType()).toBe(PaymentType.CASH);
  });

  it('should emit CASH when paymentType not changed', () => {
    const req = httpMock.expectOne((r) => r.url.includes('/q-001'));
    req.flush(mockQuote);

    dialog.onConfirm();
    expect(hostComponent.onConfirmed).toHaveBeenCalledWith({ paymentType: PaymentType.CASH });
  });

  it('should allow changing paymentType before confirm', () => {
    const req = httpMock.expectOne((r) => r.url.includes('/q-001'));
    req.flush(mockQuote);

    dialog.paymentType.set(PaymentType.CREDIT);
    dialog.onConfirm();
    expect(hostComponent.onConfirmed).toHaveBeenCalledWith({ paymentType: PaymentType.CREDIT });
  });
});
