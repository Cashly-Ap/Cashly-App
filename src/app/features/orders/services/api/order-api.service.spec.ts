import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { OrderApiService, OrderFilters, OrderProductFilters } from './order-api.service';
import { OrderStatus } from '../../models/enums/order-status.enum';

describe('OrderApiService', () => {
  let service: OrderApiService;
  let httpMock: HttpTestingController;

  const mockList = [
    {
      id: 'ord-001',
      orderNumber: 'ORD-001',
      customerId: 'c1',
      customerName: 'Test Customer',
      status: 'DRAFT',
      deliveryDate: '2025-01-15',
      subtotal: 500,
      lineCount: 2,
      invoiceId: null,
      createdAt: '2025-01-01T00:00:00Z',
    },
  ];

  const mockDetails = {
    id: 'ord-001',
    orderNumber: 'ORD-001',
    customerId: 'c1',
    customerName: 'Test Customer',
    customerRif: 'J-12345678-9',
    createdBy: 'user-001',
    createdByName: 'John Doe',
    status: 'DRAFT',
    deliveryDate: '2025-01-15',
    notes: 'Test notes',
    subtotal: 500,
    invoiceId: null,
    invoiceNumber: null,
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
            warehouseId: 'wh-001',
            warehouseCode: 'WH1',
            warehouseName: 'Central',
            availableStock: 50,
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
        totalStock: 50,
        stock: [],
      },
    ],
    totalElements: 1,
    totalPages: 1,
    number: 0,
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [OrderApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(OrderApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAll()', () => {
    it('should GET /api/orders without filters', () => {
      service.getAll().subscribe((result) => {
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('ord-001');
        expect(result[0].status).toBe(OrderStatus.DRAFT);
      });

      const req = httpMock.expectOne('/api/orders');
      expect(req.request.method).toBe('GET');
      req.flush(mockList);
    });

    it('should GET /api/orders with search filter', () => {
      const filters: OrderFilters = { search: 'ORD-001' };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/orders' && r.method === 'GET');
      expect(req.request.params.get('search')).toBe('ORD-001');
      req.flush([]);
    });

    it('should GET /api/orders with status filter', () => {
      const filters: OrderFilters = { status: 'DRAFT' };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/orders' && r.method === 'GET');
      expect(req.request.params.get('status')).toBe('DRAFT');
      req.flush([]);
    });

    it('should GET /api/orders with customerId filter', () => {
      const filters: OrderFilters = { customerId: 'c1' };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/orders' && r.method === 'GET');
      expect(req.request.params.get('customerId')).toBe('c1');
      req.flush([]);
    });

    it('should GET /api/orders with date filters', () => {
      const filters: OrderFilters = { dateFrom: '2025-01-01', dateTo: '2025-01-31' };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/orders' && r.method === 'GET');
      expect(req.request.params.get('dateFrom')).toBe('2025-01-01');
      expect(req.request.params.get('dateTo')).toBe('2025-01-31');
      req.flush([]);
    });

    it('should GET /api/orders with sorting', () => {
      const filters: OrderFilters = { orderBy: 'createdAt', orderDir: 'desc' };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/orders' && r.method === 'GET');
      expect(req.request.params.get('orderBy')).toBe('createdAt');
      expect(req.request.params.get('orderDir')).toBe('desc');
      req.flush([]);
    });

    it('should GET /api/orders with productId and categoryId filters', () => {
      const filters: OrderFilters = { productId: 'p1', categoryId: 'cat-001' };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/orders' && r.method === 'GET');
      expect(req.request.params.get('productId')).toBe('p1');
      expect(req.request.params.get('categoryId')).toBe('cat-001');
      req.flush([]);
    });
  });

  describe('getById()', () => {
    it('should GET /api/orders/:id and return details', () => {
      service.getById('ord-001').subscribe((result) => {
        expect(result.id).toBe('ord-001');
        expect(result.items).toHaveLength(1);
        expect(result.items[0].warehouseStocks).toHaveLength(1);
      });

      const req = httpMock.expectOne('/api/orders/ord-001');
      expect(req.request.method).toBe('GET');
      req.flush(mockDetails);
    });
  });

  describe('create()', () => {
    it('should POST /api/orders with data and return details', () => {
      const createData = {
        customerId: 'c1',
        notes: 'Test',
        lines: [
          { productId: 'p1', quantity: 5, unitPrice: 100, warehouseAllocations: [{ warehouseId: 'wh-001', allocated: 5 }] },
        ],
      };

      service.create(createData).subscribe((result) => {
        expect(result.id).toBe('ord-001');
      });

      const req = httpMock.expectOne('/api/orders');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createData);
      req.flush(mockDetails);
    });
  });

  describe('update()', () => {
    it('should PUT /api/orders/:id with data and return details', () => {
      const updateData = {
        notes: 'Updated',
        lines: [],
      };

      service.update('ord-001', updateData).subscribe((result) => {
        expect(result.id).toBe('ord-001');
      });

      const req = httpMock.expectOne('/api/orders/ord-001');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockDetails);
    });
  });

  describe('delete()', () => {
    it('should DELETE /api/orders/:id', () => {
      service.delete('ord-001').subscribe();

      const req = httpMock.expectOne('/api/orders/ord-001');
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });

  describe('confirm()', () => {
    it('should PUT /api/orders/:id/confirm', () => {
      service.confirm('ord-001').subscribe((result) => {
        expect(result.id).toBe('ord-001');
      });

      const req = httpMock.expectOne('/api/orders/ord-001/confirm');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({});
      req.flush(mockDetails);
    });
  });

  describe('convertToInvoice()', () => {
    it('should POST /api/orders/:id/convert-to-invoice with request body', () => {
      const request = { paymentType: 'CASH' };
      service.convertToInvoice('ord-001', request).subscribe();

      const req = httpMock.expectOne('/api/orders/ord-001/convert-to-invoice');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ paymentType: 'CASH' });
      req.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('should include optional fields when provided', () => {
      const request = {
        paymentType: 'CREDIT',
        confirmationPassword: 'secret',
      };
      service.convertToInvoice('ord-001', request).subscribe();

      const req = httpMock.expectOne('/api/orders/ord-001/convert-to-invoice');
      expect(req.request.body).toEqual({
        paymentType: 'CREDIT',
        confirmationPassword: 'secret',
      });
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });

  describe('cancel()', () => {
    it('should PUT /api/orders/:id/cancel with reason', () => {
      service.cancel('ord-001', 'Customer request').subscribe((result) => {
        expect(result.id).toBe('ord-001');
      });

      const req = httpMock.expectOne('/api/orders/ord-001/cancel');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ reason: 'Customer request' });
      req.flush(mockDetails);
    });
  });

  describe('getProductsForOrder()', () => {
    it('should GET /api/orders/products with customerId', () => {
      const filters: OrderProductFilters = { customerId: 'c1' };

      service.getProductsForOrder(filters).subscribe((result) => {
        expect(result.content).toHaveLength(1);
        expect(result.totalElements).toBe(1);
      });

      const req = httpMock.expectOne((r) => r.url === '/api/orders/products' && r.method === 'GET');
      expect(req.request.params.get('customerId')).toBe('c1');
      req.flush(mockProducts);
    });

    it('should GET /api/orders/products with search and pagination', () => {
      const filters: OrderProductFilters = { customerId: 'c1', search: 'Motor', page: 0, size: 10 };

      service.getProductsForOrder(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/orders/products' && r.method === 'GET');
      expect(req.request.params.get('search')).toBe('Motor');
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('10');
      req.flush(mockProducts);
    });

    it('should GET /api/orders/products with composite and withStock flags', () => {
      const filters: OrderProductFilters = { customerId: 'c1', composite: false, withStock: true };

      service.getProductsForOrder(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/orders/products' && r.method === 'GET');
      expect(req.request.params.get('composite')).toBe('false');
      expect(req.request.params.get('withStock')).toBe('true');
      req.flush(mockProducts);
    });

    it('should GET /api/orders/products with categoryId', () => {
      const filters: OrderProductFilters = { customerId: 'c1', categoryId: 'cat-001' };

      service.getProductsForOrder(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/orders/products' && r.method === 'GET');
      expect(req.request.params.get('categoryId')).toBe('cat-001');
      req.flush(mockProducts);
    });
  });
});
