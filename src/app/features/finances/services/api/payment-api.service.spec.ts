import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PaymentApiService, PaymentFilters } from './payment-api.service';

describe('PaymentApiService', () => {
  let service: PaymentApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PaymentApiService],
    });
    service = TestBed.inject(PaymentApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all payments', () => {
    const mockResponse = [
      {
        id: '1',
        paymentNumber: 'PAY-001',
        customerId: 'c1',
        customerName: 'Test Customer',
        type: 'PAYMENT',
        amount: 100,
        paymentMethodName: 'Efectivo',
        status: 'APPLIED',
        appliedAmount: 100,
        paymentDate: '2025-01-01',
        createdAt: '2025-01-01T00:00:00Z',
      },
    ];

    service.getAll().subscribe((result) => {
      expect(result).toHaveSize(1);
      expect(result[0].paymentNumber).toBe('PAY-001');
    });

    const req = httpMock.expectOne('/api/finances/payments');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get payment by id', () => {
    const mockResponse = {
      id: '1',
      paymentNumber: 'PAY-001',
      customerId: 'c1',
      customerName: 'Test Customer',
      customerRif: 'J123456789',
      type: 'PAYMENT',
      amount: 100,
      paymentMethodId: 'pm1',
      paymentMethodName: 'Efectivo',
      status: 'APPLIED',
      appliedAmount: 100,
      remainingAmount: 0,
      referenceNumber: null,
      paymentDate: '2025-01-01',
      notes: null,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      allocations: [],
    };

    service.getById('1').subscribe((result) => {
      expect(result.id).toBe('1');
      expect(result.allocations).toHaveSize(0);
    });

    const req = httpMock.expectOne('/api/finances/payments/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should create payment', () => {
    const createData = { customerId: 'c1', type: 'PAYMENT', amount: 100, paymentMethodId: 'pm1', paymentDate: '2025-01-01' };
    const mockResponse = {
      id: '2',
      paymentNumber: 'PAY-002',
      customerId: 'c1',
      customerName: 'Test Customer',
      customerRif: 'J123456789',
      type: 'PAYMENT',
      amount: 100,
      paymentMethodId: 'pm1',
      paymentMethodName: 'Efectivo',
      status: 'DRAFT',
      appliedAmount: 0,
      remainingAmount: 100,
      referenceNumber: null,
      paymentDate: '2025-01-01',
      notes: null,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      allocations: [],
    };

    service.create(createData).subscribe((result) => {
      expect(result.paymentNumber).toBe('PAY-002');
    });

    const req = httpMock.expectOne('/api/finances/payments');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should apply payment', () => {
    const applyData = { allocations: [{ invoiceId: 'inv1', amount: 50 }] };
    const mockResponse = {
      id: '1',
      paymentNumber: 'PAY-001',
      customerId: 'c1',
      customerName: 'Test Customer',
      customerRif: 'J123456789',
      type: 'PAYMENT',
      amount: 100,
      paymentMethodId: 'pm1',
      paymentMethodName: 'Efectivo',
      status: 'PARTIALLY_APPLIED',
      appliedAmount: 50,
      remainingAmount: 50,
      referenceNumber: null,
      paymentDate: '2025-01-01',
      notes: null,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      allocations: [{ id: 'a1', invoiceId: 'inv1', invoiceNumber: 'INV-001', allocatedAmount: 50, createdAt: '2025-01-01T00:00:00Z' }],
    };

    service.apply('1', applyData).subscribe((result) => {
      expect(result.status).toBe('PARTIALLY_APPLIED');
      expect(result.allocations).toHaveSize(1);
    });

    const req = httpMock.expectOne('/api/finances/payments/1/apply');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should cancel payment', () => {
    const mockResponse = {
      id: '1',
      paymentNumber: 'PAY-001',
      customerId: 'c1',
      customerName: 'Test Customer',
      customerRif: 'J123456789',
      type: 'PAYMENT',
      amount: 100,
      paymentMethodId: 'pm1',
      paymentMethodName: 'Efectivo',
      status: 'CANCELLED',
      appliedAmount: 0,
      remainingAmount: 0,
      referenceNumber: null,
      paymentDate: '2025-01-01',
      notes: null,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      allocations: [],
    };

    service.cancel('1', 'Test reason').subscribe((result) => {
      expect(result.status).toBe('CANCELLED');
    });

    const req = httpMock.expectOne('/api/finances/payments/1/cancel');
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);
  });
});
