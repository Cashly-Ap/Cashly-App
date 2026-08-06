import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { QuoteApplicationService } from './quote-application.service';
import { QuoteApiService } from '../api/quote-api.service';
import { of, throwError } from 'rxjs';
import { QuoteStatus } from '../../models/enums/quote-status.enum';

describe('QuoteApplicationService', () => {
  let service: QuoteApplicationService;
  let mockApi: Partial<QuoteApiService>;

  const mockQuote = {
    id: 'q-001',
    quoteNumber: 'QT-001',
    customerId: 'c1',
    customerName: 'Test Customer',
    customerRif: 'J-12345678-9',
    createdBy: 'user-001',
    createdByName: 'John Doe',
    status: QuoteStatus.DRAFT,
    notes: 'Test notes',
    subtotal: 500,
    lines: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  const mockList = [
    {
      id: 'q-001',
      quoteNumber: 'QT-001',
      customerName: 'Test Customer',
      customerRif: 'J-12345678-9',
      status: QuoteStatus.DRAFT,
      subtotal: 500,
      expiryDate: '2025-12-31',
      createdAt: '2025-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    mockApi = {
      getAll: vi.fn().mockReturnValue(of(mockList)),
      getById: vi.fn().mockReturnValue(of(mockQuote)),
      create: vi.fn().mockReturnValue(of(mockQuote)),
      update: vi.fn().mockReturnValue(of(mockQuote)),
      delete: vi.fn().mockReturnValue(of(undefined)),
      convertToOrder: vi.fn().mockReturnValue(of({ quoteId: 'q-001', quoteNumber: 'QT-001', orderId: 'ord-001', orderNumber: 'ORD-001' })),
      convertToInvoice: vi.fn().mockReturnValue(of({ quoteId: 'q-001', quoteNumber: 'QT-001', invoiceId: 'inv-001', invoiceNumber: 'FAC-001' })),
      getProductsForQuote: vi.fn().mockReturnValue(of({ content: [], totalElements: 0, totalPages: 0, number: 0 })),
      getWarehousesForQuote: vi.fn().mockReturnValue(of([])),
      assignWarehouses: vi.fn().mockReturnValue(of(mockQuote)),
    };

    TestBed.configureTestingModule({
      providers: [QuoteApplicationService, { provide: QuoteApiService, useValue: mockApi }],
    });

    service = TestBed.inject(QuoteApplicationService);
  });

  describe('loadAll()', () => {
    it('should call api.getAll and set quotes signal', () => {
      service.loadAll().subscribe();

      expect(mockApi.getAll).toHaveBeenCalled();
      expect(service.quotes()).toHaveLength(1);
      expect(service.totalElements()).toBe(1);
      expect(service.loading()).toBe(false);
    });

    it('should set error on failure', () => {
      mockApi.getAll = vi.fn().mockReturnValue(throwError(() => new Error('Network error')));

      service.loadAll().subscribe({ error: () => {} });

      expect(service.error()).toBe('Network error');
      expect(service.loading()).toBe(false);
    });
  });

  describe('loadById()', () => {
    it('should call api.getById and set currentQuote signal', () => {
      service.loadById('q-001').subscribe();

      expect(mockApi.getById).toHaveBeenCalledWith('q-001');
      expect(service.currentQuote()?.id).toBe('q-001');
      expect(service.loading()).toBe(false);
    });

    it('should set error on failure', () => {
      mockApi.getById = vi.fn().mockReturnValue(throwError(() => new Error('Not found')));

      service.loadById('q-999').subscribe({ error: () => {} });

      expect(service.error()).toBe('Not found');
    });
  });

  describe('create()', () => {
    it('should call api.create and prepend to quotes list', () => {
      service.create({ customerId: 'c1', notes: '', lines: [] }).subscribe();

      expect(mockApi.create).toHaveBeenCalled();
      expect(service.quotes()[0].id).toBe('q-001');
    });

    it('should set error on failure', () => {
      mockApi.create = vi.fn().mockReturnValue(throwError(() => new Error('Create failed')));

      service.create({ customerId: 'c1', notes: '', lines: [] }).subscribe({ error: () => {} });

      expect(service.error()).toBe('Create failed');
    });
  });

  describe('update()', () => {
    it('should call api.update and update quotes list', () => {
      service.update('q-001', { notes: null, lines: [] }).subscribe();

      expect(mockApi.update).toHaveBeenCalledWith('q-001', expect.any(Object));
    });

    it('should update currentQuote if it matches', () => {
      const updatedQuote = { ...mockQuote, notes: 'Updated notes' };
      mockApi.update = vi.fn().mockReturnValue(of(updatedQuote));
      service.currentQuote.set(mockQuote);

      service.update('q-001', { notes: 'Updated notes', lines: [] }).subscribe();

      expect(service.currentQuote()?.notes).toBe('Updated notes');
    });
  });

  describe('delete()', () => {
    it('should call api.delete and remove from quotes list', () => {
      service.quotes.set(mockList);

      service.delete('q-001').subscribe();

      expect(mockApi.delete).toHaveBeenCalledWith('q-001');
      expect(service.quotes()).toHaveLength(0);
    });
  });

  describe('convertToOrder()', () => {
    it('should call api.convertToOrder and remove from quotes list', () => {
      service.quotes.set(mockList);

      service.convertToOrder('q-001').subscribe();

      expect(mockApi.convertToOrder).toHaveBeenCalledWith('q-001');
      expect(service.quotes()).toHaveLength(0);
      expect(service.loading()).toBe(false);
    });

    it('should clear currentQuote if it matches', () => {
      service.currentQuote.set(mockQuote);
      service.quotes.set(mockList);

      service.convertToOrder('q-001').subscribe();

      expect(service.currentQuote()).toBeNull();
    });

    it('should set error on failure', () => {
      mockApi.convertToOrder = vi.fn().mockReturnValue(throwError(() => new Error('Convert failed')));

      service.convertToOrder('q-001').subscribe({ error: () => {} });

      expect(service.error()).toBe('Convert failed');
    });
  });

  describe('convertToInvoice()', () => {
    it('should call api.convertToInvoice with id and request', () => {
      const request = { paymentType: 'CASH' };
      service.convertToInvoice('q-001', request).subscribe();

      expect(mockApi.convertToInvoice).toHaveBeenCalledWith('q-001', request);
      expect(service.loading()).toBe(false);
    });

    it('should remove from quotes list and clear currentQuote', () => {
      service.quotes.set(mockList);
      service.currentQuote.set(mockQuote);

      service.convertToInvoice('q-001', { paymentType: 'CASH' }).subscribe();

      expect(service.quotes()).toHaveLength(0);
      expect(service.currentQuote()).toBeNull();
    });

    it('should set error on failure', () => {
      mockApi.convertToInvoice = vi.fn().mockReturnValue(throwError(() => new Error('Convert failed')));

      service.convertToInvoice('q-001', { paymentType: 'CASH' }).subscribe({ error: () => {} });

      expect(service.error()).toBe('Convert failed');
    });
  });

  describe('getProductsForQuote()', () => {
    it('should delegate to api.getProductsForQuote', () => {
      service.getProductsForQuote({ customerId: 'c1' }).subscribe();

      expect(mockApi.getProductsForQuote).toHaveBeenCalledWith({ customerId: 'c1' });
    });
  });

  describe('getWarehousesForQuote()', () => {
    it('should delegate to api.getWarehousesForQuote', () => {
      service.getWarehousesForQuote('c1').subscribe();

      expect(mockApi.getWarehousesForQuote).toHaveBeenCalledWith('c1');
    });
  });

  describe('assignWarehouses()', () => {
    it('should call api.assignWarehouses with id and request', () => {
      const request = {
        lines: [
          {
            lineId: 'line-001',
            allocations: [{ warehouseId: 'wh-001', allocatedQuantity: 5 }],
          },
        ],
      };
      service.assignWarehouses('q-001', request).subscribe();

      expect(mockApi.assignWarehouses).toHaveBeenCalledWith('q-001', request);
      expect(service.loading()).toBe(false);
    });

    it('should update quotes list and currentQuote on success', () => {
      const request = {
        lines: [
          {
            lineId: 'line-001',
            allocations: [{ warehouseId: 'wh-001', allocatedQuantity: 5 }],
          },
        ],
      };
      service.quotes.set(mockList);
      service.currentQuote.set(mockQuote);

      service.assignWarehouses('q-001', request).subscribe();

      expect(service.quotes()[0].status).toBe(QuoteStatus.DRAFT);
      expect(service.currentQuote()?.id).toBe('q-001');
    });

    it('should set error on failure', () => {
      mockApi.assignWarehouses = vi.fn().mockReturnValue(throwError(() => new Error('Assign failed')));

      service.assignWarehouses('q-001', { lines: [] }).subscribe({ error: () => {} });

      expect(service.error()).toBe('Assign failed');
    });
  });
});
