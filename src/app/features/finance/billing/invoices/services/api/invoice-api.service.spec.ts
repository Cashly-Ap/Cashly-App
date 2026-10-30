import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  InvoiceApiService,
  InvoiceFilters,
} from '@features/finance/billing/invoices/services/api/invoice-api.service';
import { InvoiceStatus } from '@features/finance/billing/invoices/models/enums/invoice-status.enum';
import { PaymentType } from '@features/finance/billing/invoices/models/enums/payment-type.enum';

describe('InvoiceApiService', () => {
  let service: InvoiceApiService;
  let httpMock: HttpTestingController;

  const mockList = [
    {
      id: 'inv-001',
      invoiceNumber: 'FAC-001',
      customerId: 'c1',
      customerName: 'Test Customer',
      status: 'DRAFT',
      paymentType: 'CASH',
      subtotal: 500,
      lineCount: 2,
      orderId: null,
      orderNumber: null,
      createdAt: '2025-01-01T00:00:00Z',
    },
  ];

  const mockDetails = {
    id: 'inv-001',
    invoiceNumber: 'FAC-001',
    customerId: 'c1',
    customerName: 'Test Customer',
    customerRif: 'J-12345678-9',
    createdBy: 'user-001',
    createdByName: 'John Doe',
    orderId: null,
    orderNumber: null,
    status: 'DRAFT',
    paymentType: 'CASH',
    notes: 'Test notes',
    subtotal: 500,
    creditApplied: 0,
    debitApplied: 0,
    total: 500,
    notesList: [],
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

  const mockDetailsWithNotes = {
    id: 'inv-002',
    invoiceNumber: 'FAC-002',
    customerId: 'c2',
    customerName: 'Customer B',
    customerRif: 'J-98765432-1',
    createdBy: 'user-002',
    createdByName: 'Jane Doe',
    orderId: null,
    orderNumber: null,
    status: 'PENDING_PAYMENT',
    paymentType: 'CREDIT',
    notes: null,
    subtotal: 1000,
    creditApplied: 200,
    debitApplied: 50,
    total: 850,
    notesList: [
      {
        id: 'n1',
        noteNumber: 'NC-2026-00001',
        type: 'CREDIT',
        amount: 200,
        reason: 'Discount',
        applicationDate: '2026-05-28T10:00:00Z',
      },
      {
        id: 'n2',
        noteNumber: 'ND-2026-00001',
        type: 'DEBIT',
        amount: 50,
        reason: 'Charge',
        applicationDate: '2026-05-28T11:00:00Z',
      },
    ],
    cancelledAt: null,
    cancelledReason: null,
    createdAt: '2026-05-28T00:00:00Z',
    updatedAt: '2026-05-28T00:00:00Z',
    lines: [],
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [InvoiceApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(InvoiceApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it.each([
    'EDIT',
    'CONFIRM',
    'CANCEL',
    'CONVERT_TO_ORDER',
    'CONVERT_TO_INVOICE',
    'DUPLICATE',
  ] as const)('passes backend eligibility action %s together with search', (action) => {
    service.getAll({ action, search: 'document' }).subscribe();
    const request = httpMock.expectOne((req) => req.url === '/api/invoices');
    expect(request.request.params.get('action')).toBe(action);
    expect(request.request.params.get('search')).toBe('document');
    request.flush([]);
  });

  describe('getAll()', () => {
    it('should GET /api/invoices without filters', () => {
      service.getAll().subscribe((result) => {
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('inv-001');
        expect(result[0].status).toBe(InvoiceStatus.DRAFT);
      });

      const req = httpMock.expectOne('/api/invoices');
      expect(req.request.method).toBe('GET');
      req.flush(mockList);
    });

    it('should GET /api/invoices with search filter', () => {
      const filters: InvoiceFilters = { search: 'FAC-001' };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/invoices' && r.method === 'GET');
      expect(req.request.params.get('search')).toBe('FAC-001');
      req.flush([]);
    });

    it('should GET /api/invoices with status filters', () => {
      const filters: InvoiceFilters = { statuses: ['DRAFT', 'PENDING_PAYMENT'] };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/invoices' && r.method === 'GET');
      expect(req.request.params.getAll('status')).toEqual(['DRAFT', 'PENDING_PAYMENT']);
      req.flush([]);
    });

    it('should GET /api/invoices with customerId filter', () => {
      const filters: InvoiceFilters = { customerId: 'c1' };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/invoices' && r.method === 'GET');
      expect(req.request.params.get('customerId')).toBe('c1');
      req.flush([]);
    });

    it('should GET /api/invoices with paymentType filter', () => {
      const filters: InvoiceFilters = { paymentType: 'CASH' };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/invoices' && r.method === 'GET');
      expect(req.request.params.get('paymentType')).toBe('CASH');
      req.flush([]);
    });

    it('should GET /api/invoices with date filters', () => {
      const filters: InvoiceFilters = { dateFrom: '2025-01-01', dateTo: '2025-01-31' };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/invoices' && r.method === 'GET');
      expect(req.request.params.get('fromDate')).toBe('2025-01-01');
      expect(req.request.params.get('toDate')).toBe('2025-01-31');
      req.flush([]);
    });

    it('should GET /api/invoices with sorting', () => {
      const filters: InvoiceFilters = { orderBy: 'createdAt', orderDir: 'desc' };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/invoices' && r.method === 'GET');
      expect(req.request.params.get('orderBy')).toBe('createdAt');
      expect(req.request.params.get('orderDir')).toBe('desc');
      req.flush([]);
    });
  });

  describe('getById()', () => {
    it('should GET /api/invoices/:id and return details', () => {
      service.getById('inv-001').subscribe((result) => {
        expect(result.id).toBe('inv-001');
        expect(result.lines).toHaveLength(1);
        expect(result.lines[0].warehouseStocks).toHaveLength(1);
        expect(result.creditApplied).toBe(0);
        expect(result.debitApplied).toBe(0);
        expect(result.total).toBe(500);
        expect(result.notesList).toEqual([]);
      });

      const req = httpMock.expectOne('/api/invoices/inv-001');
      expect(req.request.method).toBe('GET');
      req.flush(mockDetails);
    });

    it('should map notes from response', () => {
      service.getById('inv-002').subscribe((result) => {
        expect(result.creditApplied).toBe(200);
        expect(result.debitApplied).toBe(50);
        expect(result.total).toBe(850);
        expect(result.notesList).toHaveLength(2);
        expect(result.notesList[0].type).toBe('CREDIT');
        expect(result.notesList[1].type).toBe('DEBIT');
        expect(result.notesList[0].noteNumber).toBe('NC-2026-00001');
        expect(result.notesList[1].noteNumber).toBe('ND-2026-00001');
        expect(result.notesList[0].amount).toBe(200);
        expect(result.notesList[1].amount).toBe(50);
      });

      const req = httpMock.expectOne('/api/invoices/inv-002');
      expect(req.request.method).toBe('GET');
      req.flush(mockDetailsWithNotes);
    });
  });

  describe('create()', () => {
    it('should POST /api/invoices with data and return details', () => {
      const createData = {
        customerId: 'c1',
        paymentType: PaymentType.CASH,
        notes: 'Test',
        lines: [
          {
            productId: 'p1',
            quantity: 5,
            unitPrice: 100,
            warehouseAllocations: [{ warehouseId: 'wh-001', allocated: 5 }],
          },
        ],
      };

      service.create(createData).subscribe((result) => {
        expect(result.id).toBe('inv-001');
      });

      const req = httpMock.expectOne('/api/invoices');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createData);
      req.flush(mockDetails);
    });
  });

  describe('update()', () => {
    it('should PUT /api/invoices/:id with data and return details', () => {
      const updateData = {
        paymentType: PaymentType.CREDIT,
        notes: 'Updated',
        lines: [],
      };

      service.update('inv-001', updateData).subscribe((result) => {
        expect(result.id).toBe('inv-001');
      });

      const req = httpMock.expectOne('/api/invoices/inv-001');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockDetails);
    });
  });

  describe('cancel()', () => {
    it('should PUT /api/invoices/:id/cancel with reason', () => {
      service.cancel('inv-001', 'Customer request').subscribe((result) => {
        expect(result.status).toBe(InvoiceStatus.CANCELLED);
      });

      const req = httpMock.expectOne('/api/invoices/inv-001/cancel');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ reason: 'Customer request' });
      req.flush({ ...mockDetails, status: 'CANCELLED' });
    });
  });

  describe('delete()', () => {
    it('should DELETE /api/invoices/:id', () => {
      service.delete('inv-001').subscribe();

      const req = httpMock.expectOne('/api/invoices/inv-001');
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });

  describe('confirm()', () => {
    it('should PUT /api/invoices/:id/confirm', () => {
      service.confirm('inv-001').subscribe((result) => {
        expect(result.id).toBe('inv-001');
      });

      const req = httpMock.expectOne('/api/invoices/inv-001/confirm');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({});
      req.flush(mockDetails);
    });
  });

  describe('duplicate()', () => {
    it('should POST /api/invoices/:id/duplicate', () => {
      service.duplicate('inv-001').subscribe((result) => {
        expect(result.id).toBe('inv-001');
      });

      const req = httpMock.expectOne('/api/invoices/inv-001/duplicate');
      expect(req.request.method).toBe('POST');
      req.flush(mockDetails);
    });
  });
});
