import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { FinanceApplicationService } from './finance-application.service';
import { PaymentMethodApiService, PaymentMethodFilters } from '../api/payment-method-api.service';
import { PaymentMethodList, PaymentMethodDetail } from '../../models/interfaces';

describe('FinanceApplicationService', () => {
  let service: FinanceApplicationService;
  let mockApi: Partial<PaymentMethodApiService>;

  const mockPaymentMethodList: PaymentMethodList = {
    id: 'pm-001',
    code: 'CASH',
    name: 'Efectivo',
    description: null,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
  };

  const mockPaymentMethodDetail: PaymentMethodDetail = {
    id: 'pm-001',
    code: 'CASH',
    name: 'Efectivo',
    description: 'Pago en efectivo',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  beforeEach(() => {
    mockApi = {
      getAll: vi.fn().mockReturnValue(
        of({
          content: [mockPaymentMethodList],
          totalElements: 1,
          totalPages: 1,
          size: 10,
          number: 0,
          first: true,
          last: true,
          empty: false,
        }),
      ),
      getById: vi.fn().mockReturnValue(of(mockPaymentMethodDetail)),
      create: vi.fn().mockReturnValue(of(mockPaymentMethodDetail)),
      update: vi.fn().mockReturnValue(of(mockPaymentMethodDetail)),
      toggle: vi.fn().mockReturnValue(of({ ...mockPaymentMethodDetail, isActive: false })),
    };

    TestBed.configureTestingModule({
      providers: [
        FinanceApplicationService,
        { provide: PaymentMethodApiService, useValue: mockApi },
      ],
    });

    service = TestBed.inject(FinanceApplicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load payment methods', () => {
    service.loadPaymentMethods().subscribe();
    expect(mockApi.getAll).toHaveBeenCalled();
    expect(service.paymentMethods()).toHaveLength(1);
    expect(service.totalElements()).toBe(1);
  });

  it('should load payment method by id', () => {
    service.loadPaymentMethodById('pm-001').subscribe();
    expect(mockApi.getById).toHaveBeenCalledWith('pm-001');
    expect(service.currentPaymentMethod()).toEqual(mockPaymentMethodDetail);
  });

  it('should create payment method', () => {
    service.createPaymentMethod({ name: 'Transferencia' }).subscribe();
    expect(mockApi.create).toHaveBeenCalled();
    expect(service.paymentMethods()).toHaveLength(1);
  });

  it('should update payment method', () => {
    service.paymentMethods.set([mockPaymentMethodList]);
    service.updatePaymentMethod('pm-001', { name: 'Efectivo Actualizado' }).subscribe();
    expect(mockApi.update).toHaveBeenCalledWith('pm-001', { name: 'Efectivo Actualizado' });
  });

  it('should toggle payment method', () => {
    service.paymentMethods.set([mockPaymentMethodList]);
    service.togglePaymentMethod('pm-001').subscribe();
    expect(mockApi.toggle).toHaveBeenCalledWith('pm-001');
    expect(service.paymentMethods()[0].isActive).toBe(false);
  });

  it('should set error on load failure', () => {
    mockApi.getAll = vi.fn().mockReturnValue(throwError(() => new Error('Network error')));
    service.loadPaymentMethods().subscribe({ error: () => {} });
    expect(service.error()).toBe('Network error');
  });
});
