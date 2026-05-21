import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PaymentMethodApiService, PaymentMethodFilters } from './payment-method-api.service';

describe('PaymentMethodApiService', () => {
  let service: PaymentMethodApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PaymentMethodApiService],
    });
    service = TestBed.inject(PaymentMethodApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all payment methods', () => {
    const mockResponse = [
      {
        id: '1',
        code: 'CASH',
        name: 'Efectivo',
        description: null,
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
      },
    ];

    service.getAll().subscribe((result) => {
      expect(result.content).toHaveSize(1);
      expect(result.content[0].name).toBe('Efectivo');
    });

    const req = httpMock.expectOne('/api/finances/payment-methods');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get payment method by id', () => {
    const mockResponse = {
      id: '1',
      code: 'CASH',
      name: 'Efectivo',
      description: 'Pago en efectivo',
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };

    service.getById('1').subscribe((result) => {
      expect(result.id).toBe('1');
      expect(result.name).toBe('Efectivo');
    });

    const req = httpMock.expectOne('/api/finances/payment-methods/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should create payment method', () => {
    const createData = { name: 'Transferencia', description: 'Transferencia bancaria' };
    const mockResponse = {
      id: '2',
      code: 'BANK_TRANSFER',
      name: 'Transferencia',
      description: 'Transferencia bancaria',
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };

    service.create(createData).subscribe((result) => {
      expect(result.name).toBe('Transferencia');
    });

    const req = httpMock.expectOne('/api/finances/payment-methods');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should update payment method', () => {
    const updateData = { name: 'Efectivo Actualizado' };
    const mockResponse = {
      id: '1',
      code: 'CASH',
      name: 'Efectivo Actualizado',
      description: null,
      isActive: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
    };

    service.update('1', updateData).subscribe((result) => {
      expect(result.name).toBe('Efectivo Actualizado');
    });

    const req = httpMock.expectOne('/api/finances/payment-methods/1');
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);
  });

  it('should toggle payment method', () => {
    const mockResponse = {
      id: '1',
      code: 'CASH',
      name: 'Efectivo',
      description: null,
      isActive: false,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
    };

    service.toggle('1').subscribe((result) => {
      expect(result.isActive).toBe(false);
    });

    const req = httpMock.expectOne('/api/finances/payment-methods/1/toggle');
    expect(req.request.method).toBe('PATCH');
    req.flush(mockResponse);
  });
});
