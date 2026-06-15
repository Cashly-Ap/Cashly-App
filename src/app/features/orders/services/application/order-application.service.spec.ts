import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { OrderApplicationService } from './order-application.service';
import { OrderApiService } from '../api/order-api.service';
import { of, throwError } from 'rxjs';
import { OrderStatus } from '../../models/enums/order-status.enum';

describe('OrderApplicationService', () => {
  let service: OrderApplicationService;
  let mockApi: Partial<OrderApiService>;

  const mockOrder = {
    id: 'ord-001',
    orderNumber: 'ORD-001',
    customerId: 'c1',
    customerAlias: 'Test Customer',
    customerLegalName: 'J-12345678-9',
    status: OrderStatus.DRAFT,
    notes: 'Test notes',
    totalAmount: 500,
    items: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  const mockList = [
    {
      id: 'ord-001',
      orderNumber: 'ORD-001',
      customerId: 'c1',
      customerAlias: 'Test Customer',
      status: OrderStatus.DRAFT,
      totalAmount: 500,
      createdAt: '2025-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    mockApi = {
      getAll: vi.fn().mockReturnValue(of(mockList)),
      getById: vi.fn().mockReturnValue(of(mockOrder)),
      create: vi.fn().mockReturnValue(of(mockOrder)),
      update: vi.fn().mockReturnValue(of(mockOrder)),
      cancel: vi.fn().mockReturnValue(of(mockOrder)),
      delete: vi.fn().mockReturnValue(of(undefined)),
      confirm: vi.fn().mockReturnValue(of(mockOrder)),
      convertToInvoice: vi.fn().mockReturnValue(of(undefined)),
      getProductsForOrder: vi.fn().mockReturnValue(of({ content: [], totalElements: 0, totalPages: 0, number: 0 })),
    };

    TestBed.configureTestingModule({
      providers: [OrderApplicationService, { provide: OrderApiService, useValue: mockApi }],
    });

    service = TestBed.inject(OrderApplicationService);
  });

  describe('loadAll()', () => {
    it('should call api.getAll and set orders signal', () => {
      service.loadAll().subscribe();

      expect(mockApi.getAll).toHaveBeenCalled();
      expect(service.orders()).toHaveLength(1);
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
    it('should call api.getById and set currentOrder signal', () => {
      service.loadById('ord-001').subscribe();

      expect(mockApi.getById).toHaveBeenCalledWith('ord-001');
      expect(service.currentOrder()?.id).toBe('ord-001');
      expect(service.loading()).toBe(false);
    });

    it('should set error on failure', () => {
      mockApi.getById = vi.fn().mockReturnValue(throwError(() => new Error('Not found')));

      service.loadById('ord-999').subscribe({ error: () => {} });

      expect(service.error()).toBe('Not found');
    });
  });

  describe('create()', () => {
    it('should call api.create and prepend to orders list', () => {
      service.create({ customerId: 'c1', notes: '', lines: [] }).subscribe();

      expect(mockApi.create).toHaveBeenCalled();
      expect(service.orders()[0].id).toBe('ord-001');
    });

    it('should set error on failure', () => {
      mockApi.create = vi.fn().mockReturnValue(throwError(() => new Error('Create failed')));

      service.create({ customerId: 'c1', notes: '', lines: [] }).subscribe({ error: () => {} });

      expect(service.error()).toBe('Create failed');
    });
  });

  describe('update()', () => {
    it('should call api.update and update orders list', () => {
      service.update('ord-001', { notes: null, lines: [] }).subscribe();

      expect(mockApi.update).toHaveBeenCalledWith('ord-001', expect.any(Object));
    });

    it('should update currentOrder if it matches', () => {
      const updatedOrder = { ...mockOrder, notes: 'Updated notes' };
      mockApi.update = vi.fn().mockReturnValue(of(updatedOrder));
      service.currentOrder.set(mockOrder);

      service.update('ord-001', { notes: 'Updated notes', lines: [] }).subscribe();

      expect(service.currentOrder()?.notes).toBe('Updated notes');
    });
  });

  describe('delete()', () => {
    it('should call api.delete and remove from orders list', () => {
      service.orders.set(mockList);

      service.delete('ord-001').subscribe();

      expect(mockApi.delete).toHaveBeenCalledWith('ord-001');
      expect(service.orders()).toHaveLength(0);
    });
  });

  describe('confirm()', () => {
    it('should call api.confirm and update order in list', () => {
      service.orders.set(mockList);

      service.confirm('ord-001').subscribe();

      expect(mockApi.confirm).toHaveBeenCalledWith('ord-001');
    });
  });

  describe('convertToInvoice()', () => {
    it('should call api.convertToInvoice with id and request', () => {
      const request = { paymentType: 'CASH' };
      service.convertToInvoice('ord-001', request).subscribe();

      expect(mockApi.convertToInvoice).toHaveBeenCalledWith('ord-001', request);
      expect(service.loading()).toBe(false);
    });

    it('should set error on failure', () => {
      mockApi.convertToInvoice = vi.fn().mockReturnValue(throwError(() => new Error('Convert failed')));

      service.convertToInvoice('ord-001', { paymentType: 'CASH' }).subscribe({ error: () => {} });

      expect(service.error()).toBe('Convert failed');
    });
  });

  describe('cancel()', () => {
    it('should call api.cancel with id and reason', () => {
      service.cancel('ord-001', 'Customer request').subscribe();

      expect(mockApi.cancel).toHaveBeenCalledWith('ord-001', 'Customer request');
    });
  });
});
