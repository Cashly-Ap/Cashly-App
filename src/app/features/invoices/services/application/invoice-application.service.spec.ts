import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { InvoiceApplicationService } from './invoice-application.service';
import { InvoiceApiService } from '../api/invoice-api.service';
import { of, throwError } from 'rxjs';
import { InvoiceStatus } from '../../models/enums/invoice-status.enum';
import { PaymentType } from '../../models/enums/payment-type.enum';

describe('InvoiceApplicationService', () => {
  let service: InvoiceApplicationService;
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
    lines: [],
  };

  const mockList = [
    {
      id: 'inv-001',
      invoiceNumber: 'FAC-001',
      customerId: 'c1',
      customerName: 'Test Customer',
      status: InvoiceStatus.DRAFT,
      paymentType: PaymentType.CASH,
      subtotal: 500,
      lineCount: 2,
      orderId: null,
      orderNumber: null,
      createdAt: '2025-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    mockApi = {
      getAll: vi.fn().mockReturnValue(of(mockList)),
      getById: vi.fn().mockReturnValue(of(mockInvoice)),
      create: vi.fn().mockReturnValue(of(mockInvoice)),
      update: vi.fn().mockReturnValue(of(mockInvoice)),
      cancel: vi.fn().mockReturnValue(of(mockInvoice)),
      delete: vi.fn().mockReturnValue(of(undefined)),
      confirm: vi.fn().mockReturnValue(of(mockInvoice)),
      duplicate: vi.fn().mockReturnValue(of(mockInvoice)),
    };

    TestBed.configureTestingModule({
      providers: [
        InvoiceApplicationService,
        { provide: InvoiceApiService, useValue: mockApi },
      ],
    });

    service = TestBed.inject(InvoiceApplicationService);
  });

  describe('loadAll()', () => {
    it('should call api.getAll and set invoices signal', () => {
      service.loadAll().subscribe();

      expect(mockApi.getAll).toHaveBeenCalled();
      expect(service.invoices()).toHaveLength(1);
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
    it('should call api.getById and set currentInvoice signal', () => {
      service.loadById('inv-001').subscribe();

      expect(mockApi.getById).toHaveBeenCalledWith('inv-001');
      expect(service.currentInvoice()?.id).toBe('inv-001');
      expect(service.loading()).toBe(false);
    });

    it('should set error on failure', () => {
      mockApi.getById = vi.fn().mockReturnValue(throwError(() => new Error('Not found')));

      service.loadById('inv-999').subscribe({ error: () => {} });

      expect(service.error()).toBe('Not found');
    });
  });

  describe('create()', () => {
    it('should call api.create and prepend to invoices list', () => {
      service.create({ customerId: 'c1', paymentType: PaymentType.CASH, notes: '', lines: [] }).subscribe();

      expect(mockApi.create).toHaveBeenCalled();
      expect(service.invoices()[0].id).toBe('inv-001');
    });

    it('should set error on failure', () => {
      mockApi.create = vi.fn().mockReturnValue(throwError(() => new Error('Create failed')));

      service.create({ customerId: 'c1', paymentType: PaymentType.CASH, notes: '', lines: [] }).subscribe({ error: () => {} });

      expect(service.error()).toBe('Create failed');
    });
  });

  describe('update()', () => {
    it('should call api.update and update invoices list', () => {
      service.update('inv-001', { paymentType: PaymentType.CREDIT, notes: null, lines: [] }).subscribe();

      expect(mockApi.update).toHaveBeenCalledWith('inv-001', expect.any(Object));
    });

    it('should update currentInvoice if it matches', () => {
      const updatedInvoice = { ...mockInvoice, paymentType: PaymentType.CREDIT };
      mockApi.update = vi.fn().mockReturnValue(of(updatedInvoice));
      service.currentInvoice.set(mockInvoice);

      service.update('inv-001', { paymentType: PaymentType.CREDIT, notes: null, lines: [] }).subscribe();

      expect(service.currentInvoice()?.paymentType).toBe(PaymentType.CREDIT);
    });
  });

  describe('cancel()', () => {
    it('should call api.cancel with id and reason', () => {
      service.cancel('inv-001', 'Customer request').subscribe();

      expect(mockApi.cancel).toHaveBeenCalledWith('inv-001', 'Customer request');
    });
  });

  describe('delete()', () => {
    it('should call api.delete and remove from invoices list', () => {
      service.invoices.set(mockList);

      service.delete('inv-001').subscribe();

      expect(mockApi.delete).toHaveBeenCalledWith('inv-001');
      expect(service.invoices()).toHaveLength(0);
    });
  });

  describe('confirm()', () => {
    it('should call api.confirm and update invoice in list', () => {
      service.invoices.set(mockList);

      service.confirm('inv-001').subscribe();

      expect(mockApi.confirm).toHaveBeenCalledWith('inv-001');
    });
  });

  describe('duplicate()', () => {
    it('should call api.duplicate and prepend to invoices list', () => {
      service.duplicate('inv-001').subscribe();

      expect(mockApi.duplicate).toHaveBeenCalledWith('inv-001');
      expect(service.invoices()[0].id).toBe('inv-001');
    });
  });
});
