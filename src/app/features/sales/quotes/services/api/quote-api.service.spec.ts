import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  QuoteApiService,
  QuoteFilters,
  QuoteProductFilters,
} from '@features/sales/quotes/services/api/quote-api.service';
import { QuoteStatus } from '@features/sales/quotes/models/enums/quote-status.enum';

describe('QuoteApiService', () => {
  let service: QuoteApiService;
  let httpMock: HttpTestingController;

  const mockList = [
    {
      id: 'q-001',
      quoteNumber: 'QT-001',
      customerName: 'Test Customer',
      customerRif: 'J-12345678-9',
      status: 'DRAFT',
      subtotal: 500,
      expiryDate: '2025-12-31',
      createdBy: 'user-001',
      createdByName: 'John Doe',
      createdAt: '2025-01-01T00:00:00Z',
    },
  ];

  const mockDetails = {
    id: 'q-001',
    quoteNumber: 'QT-001',
    customerId: 'c1',
    customerName: 'Test Customer',
    customerRif: 'J-12345678-9',
    createdBy: 'user-001',
    createdByName: 'John Doe',
    status: 'DRAFT',
    notes: 'Test notes',
    subtotal: 500,
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
        subtotal: 500,
        allocations: [
          {
            warehouseId: 'wh-001',
            warehouseName: 'Central',
            warehouseCode: 'WH1',
            allocatedQuantity: 5,
          },
        ],
        warehouseStocks: [
          {
            warehouseId: 'wh-001',
            warehouseName: 'Central',
            available: 40,
          },
        ],
      },
    ],
  };

  const mockProducts = {
    content: [
      {
        id: 'p1',
        code: 'MOT-10',
        name: 'Motor 10HP',
        categoryId: 'cat-001',
        categoryName: 'Motors',
        composite: false,
        active: true,
        photo: null,
        customerPrice: 100,
      },
    ],
    totalElements: 1,
    totalPages: 1,
    number: 0,
  };

  const mockWarehouses = [{ id: 'wh-001', name: 'Central Warehouse', address: '123 Main St' }];

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [QuoteApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(QuoteApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it.each(['EDIT', 'CONFIRM', 'CANCEL', 'CONVERT_TO_ORDER', 'CONVERT_TO_INVOICE', 'DUPLICATE'] as const)(
    'passes backend eligibility action %s together with search', (action) => {
      service.getAll({ action, search: 'document' }).subscribe();
      const request = httpMock.expectOne((req) => req.url === '/api/quotes');
      expect(request.request.params.get('action')).toBe(action);
      expect(request.request.params.get('search')).toBe('document');
      request.flush([]);
    },
  );

  describe('getAll()', () => {
    it('should GET /api/quotes without filters', () => {
      service.getAll().subscribe((result) => {
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('q-001');
        expect(result[0].status).toBe(QuoteStatus.DRAFT);
        expect(result[0].createdByName).toBe('John Doe');
      });

      const req = httpMock.expectOne('/api/quotes');
      expect(req.request.method).toBe('GET');
      req.flush(mockList);
    });

    it('should GET /api/quotes with search filter', () => {
      const filters: QuoteFilters = { search: 'QT-001' };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/quotes' && r.method === 'GET');
      expect(req.request.params.get('search')).toBe('QT-001');
      req.flush([]);
    });

    it('should GET /api/quotes with status filter', () => {
      const filters: QuoteFilters = { status: 'DRAFT' };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/quotes' && r.method === 'GET');
      expect(req.request.params.get('status')).toBe('DRAFT');
      req.flush([]);
    });

    it('should GET /api/quotes with customerId filter', () => {
      const filters: QuoteFilters = { customerId: 'c1' };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/quotes' && r.method === 'GET');
      expect(req.request.params.get('customerId')).toBe('c1');
      req.flush([]);
    });

    it('should GET /api/quotes with date filters', () => {
      const filters: QuoteFilters = { dateFrom: '2025-01-01', dateTo: '2025-01-31' };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/quotes' && r.method === 'GET');
      expect(req.request.params.get('dateFrom')).toBe('2025-01-01');
      expect(req.request.params.get('dateTo')).toBe('2025-01-31');
      req.flush([]);
    });

    it('should GET /api/quotes with sorting', () => {
      const filters: QuoteFilters = { orderBy: 'createdAt', orderDir: 'desc' };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/quotes' && r.method === 'GET');
      expect(req.request.params.get('orderBy')).toBe('createdAt');
      expect(req.request.params.get('orderDir')).toBe('desc');
      req.flush([]);
    });

    it('should GET /api/quotes with productId and categoryId filters', () => {
      const filters: QuoteFilters = { productId: 'p1', categoryId: 'cat-001' };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/quotes' && r.method === 'GET');
      expect(req.request.params.get('productId')).toBe('p1');
      expect(req.request.params.get('categoryId')).toBe('cat-001');
      req.flush([]);
    });
  });

  describe('getById()', () => {
    it('should GET /api/quotes/:id and return details', () => {
      service.getById('q-001').subscribe((result) => {
        expect(result.id).toBe('q-001');
        expect(result.lines).toHaveLength(1);
        expect(result.lines[0].warehouseStocks).toHaveLength(1);
      });

      const req = httpMock.expectOne('/api/quotes/q-001');
      expect(req.request.method).toBe('GET');
      req.flush(mockDetails);
    });
  });

  describe('create()', () => {
    it('should POST /api/quotes with data and return details', () => {
      const createData = {
        customerId: 'c1',
        notes: 'Test',
        lines: [
          {
            productId: 'p1',
            quantity: 5,
            unitPrice: 100,
            warehouseAllocations: [{ warehouseId: 'wh-001', allocatedQuantity: 5 }],
          },
        ],
      };

      service.create(createData).subscribe((result) => {
        expect(result.id).toBe('q-001');
      });

      const req = httpMock.expectOne('/api/quotes');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createData);
      req.flush(mockDetails);
    });
  });

  describe('update()', () => {
    it('should PUT /api/quotes/:id with data and return details', () => {
      const updateData = {
        notes: 'Updated',
        lines: [],
      };

      service.update('q-001', updateData).subscribe((result) => {
        expect(result.id).toBe('q-001');
      });

      const req = httpMock.expectOne('/api/quotes/q-001');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockDetails);
    });
  });

  describe('delete()', () => {
    it('should DELETE /api/quotes/:id', () => {
      service.delete('q-001').subscribe();

      const req = httpMock.expectOne('/api/quotes/q-001');
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });

  describe('getProductsForQuote()', () => {
    it('should GET /api/products with customerId', () => {
      const filters: QuoteProductFilters = { customerId: 'c1' };

      service.getProductsForQuote(filters).subscribe((result) => {
        expect(result.content).toHaveLength(1);
        expect(result.totalElements).toBe(1);
      });

      const req = httpMock.expectOne((r) => r.url === '/api/products' && r.method === 'GET');
      expect(req.request.params.get('customerId')).toBe('c1');
      req.flush(mockProducts);
    });

    it('should GET /api/products with search and pagination', () => {
      const filters: QuoteProductFilters = { customerId: 'c1', search: 'Motor', page: 0, size: 10 };

      service.getProductsForQuote(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/products' && r.method === 'GET');
      expect(req.request.params.get('search')).toBe('Motor');
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('10');
      req.flush(mockProducts);
    });

    it('should GET /api/products with composite flag', () => {
      const filters: QuoteProductFilters = { customerId: 'c1', composite: false };

      service.getProductsForQuote(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/products' && r.method === 'GET');
      expect(req.request.params.get('composite')).toBe('false');
      req.flush(mockProducts);
    });

    it('should GET /api/products with categoryId', () => {
      const filters: QuoteProductFilters = { customerId: 'c1', categoryId: 'cat-001' };

      service.getProductsForQuote(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/products' && r.method === 'GET');
      expect(req.request.params.get('categoryId')).toBe('cat-001');
      req.flush(mockProducts);
    });
  });

  describe('getWarehousesForQuote()', () => {
    it('should GET /api/quotes/warehouses with customerId', () => {
      service.getWarehousesForQuote('c1').subscribe((result) => {
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('wh-001');
      });

      const req = httpMock.expectOne(
        (r) => r.url === '/api/quotes/warehouses' && r.method === 'GET',
      );
      expect(req.request.params.get('customerId')).toBe('c1');
      req.flush(mockWarehouses);
    });
  });

  describe('convertToOrder()', () => {
    it('should POST /api/quotes/:id/convert-to-order', () => {
      service.convertToOrder('q-001').subscribe((result) => {
        expect(result.quoteId).toBe('q-001');
        expect(result.orderId).toBe('ord-001');
      });

      const req = httpMock.expectOne('/api/quotes/q-001/convert-to-order');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush({
        quoteId: 'q-001',
        quoteNumber: 'QT-001',
        orderId: 'ord-001',
        orderNumber: 'ORD-001',
      });
    });
  });

  describe('convertToInvoice()', () => {
    it('should POST /api/quotes/:id/convert-to-invoice with request body', () => {
      const request = { paymentType: 'CASH' };
      service.convertToInvoice('q-001', request).subscribe((result) => {
        expect(result.quoteId).toBe('q-001');
        expect(result.invoiceId).toBe('inv-001');
      });

      const req = httpMock.expectOne('/api/quotes/q-001/convert-to-invoice');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ paymentType: 'CASH' });
      req.flush({
        quoteId: 'q-001',
        quoteNumber: 'QT-001',
        invoiceId: 'inv-001',
        invoiceNumber: 'FAC-001',
      });
    });

    it('should include optional fields when provided', () => {
      const request = {
        paymentType: 'CREDIT',
        confirmationPassword: 'secret',
        useBalance: false,
      };
      service.convertToInvoice('q-001', request).subscribe();

      const req = httpMock.expectOne('/api/quotes/q-001/convert-to-invoice');
      expect(req.request.body).toEqual({
        paymentType: 'CREDIT',
        confirmationPassword: 'secret',
        useBalance: false,
      });
      req.flush({
        quoteId: 'q-001',
        quoteNumber: 'QT-001',
        invoiceId: 'inv-001',
        invoiceNumber: 'FAC-001',
      });
    });
  });
});
