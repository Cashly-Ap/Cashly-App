import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ConvertToOrderDialogComponent } from '@features/sales/quotes/components/convert-to-order-dialog/convert-to-order-dialog.component';

@Component({
  template: `<app-convert-to-order-dialog
    [visible]="visible"
    [quoteId]="quoteId"
    (confirmed)="onConfirmed()"
    (cancelled)="onCancelled()"
  ></app-convert-to-order-dialog>`,
  imports: [ConvertToOrderDialogComponent],
})
class HostComponent {
  visible = false;
  quoteId: string | null = null;
  onConfirmed = vi.fn();
  onCancelled = vi.fn();
}

describe('ConvertToOrderDialogComponent', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialog: ConvertToOrderDialogComponent;
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
          {
            warehouseId: 'wh-001',
            warehouseName: 'Central',
            warehouseCode: 'WH1',
            allocatedQuantity: 5,
          },
        ],
        warehouseStocks: [{ warehouseId: 'wh-001', warehouseName: 'Central', available: 50 }],
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

  it('should emit confirmed on confirm', () => {
    dialog.onConfirm();
    expect(hostComponent.onConfirmed).toHaveBeenCalled();
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

describe('ConvertToOrderDialogComponent - visible with data', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialog: ConvertToOrderDialogComponent;
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
          {
            warehouseId: 'wh-001',
            warehouseName: 'Central',
            warehouseCode: 'WH1',
            allocatedQuantity: 5,
          },
        ],
        warehouseStocks: [{ warehouseId: 'wh-001', warehouseName: 'Central', available: 50 }],
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
          warehouseStocks: [{ warehouseId: 'wh-001', warehouseName: 'Central', available: 2 }],
        },
      ],
    };

    const req = httpMock.expectOne((r) => r.url.includes('/q-001'));
    req.flush(negativeQuote);

    expect(dialog.hasAnyNegativeStock()).toBe(true);
    expect(dialog.lines()[0].hasNegativeStock).toBe(true);
  });

  it('should have empty lines and no quoteInfo by default', () => {
    expect(dialog.lines()).toEqual([]);
    expect(dialog.quoteInfo()).toBeNull();
    expect(dialog.error()).toBeNull();
    expect(dialog.hasAnyNegativeStock()).toBe(false);
  });

  it('should emit confirmed when stock is OK', () => {
    const req = httpMock.expectOne((r) => r.url.includes('/q-001'));
    req.flush(mockQuote);

    dialog.onConfirm();
    expect(hostComponent.onConfirmed).toHaveBeenCalled();
  });
});
