import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PayablesApiService } from '@features/finance/treasury/payables/services/api/payables-api.service';

describe('Payables action queries', () => {
  let service: PayablesApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PayablesApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it.each(['PAY_ALL', 'PAY_PARTIAL', 'REFUND'] as const)(
    'sends %s to the server before supplier pagination',
    (action) => {
      service.searchSuppliersWithDebt({ action, page: 2, size: 10, search: 'Prov' }).subscribe();
      const request = http.expectOne((item) => item.url.endsWith('/payables/suppliers'));
      expect(request.request.params.get('action')).toBe(action);
      expect(request.request.params.get('page')).toBe('2');
      expect(request.request.params.get('size')).toBe('10');
      expect(request.request.params.get('search')).toBe('Prov');
      request.flush({ content: [] });
    },
  );

  it('does not restrict the regular supplier list', () => {
    service.searchSuppliersWithDebt({ page: 0 }).subscribe();
    const request = http.expectOne((item) => item.url.endsWith('/payables/suppliers'));
    expect(request.request.params.has('action')).toBe(false);
    request.flush({ content: [] });
  });

  it('loads supplier purchases with the status filter', () => {
    service.getSupplierPurchases('supplier-1', { status: 'CONFIRMED', page: 1 }).subscribe();
    const request = http.expectOne((item) =>
      item.url.endsWith('/payables/suppliers/supplier-1/purchases'),
    );
    expect(request.request.params.get('status')).toBe('CONFIRMED');
    expect(request.request.params.get('page')).toBe('1');
    request.flush({ content: [] });
  });

  it('creates a pending payment for validation', () => {
    service
      .createPayment({
        supplierId: 'supplier-1',
        status: 'PENDING',
        amount: 25,
        paymentMethodId: 'method-1',
        referenceNumber: 'REF-1',
        paymentDate: '2026-01-15',
      })
      .subscribe();
    const request = http.expectOne((item) => item.url.endsWith('/supplier-payments'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toMatchObject({
      supplierId: 'supplier-1',
      status: 'PENDING',
      amount: 25,
      paymentMethodId: 'method-1',
    });
    request.flush({ id: 'payment-1', status: 'PENDING' });
  });

  it('pays a purchase through the supplier payments endpoint', () => {
    service
      .payPurchase('purchase-1', {
        paymentMethodId: 'method-1',
        amount: 50,
        paymentDate: '2026-01-15',
      })
      .subscribe();
    const request = http.expectOne((item) =>
      item.url.endsWith('/supplier-payments/purchases/purchase-1/pay'),
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toMatchObject({ amount: 50, paymentMethodId: 'method-1' });
    request.flush({ id: 'payment-1', status: 'APPLIED' });
  });

  it('pays all supplier debt', () => {
    service
      .payAllSupplierDebt('supplier-1', {
        paymentMethodId: 'method-1',
        amount: 100,
        paymentDate: '2026-01-15',
      })
      .subscribe();
    const request = http.expectOne((item) =>
      item.url.endsWith('/supplier-payments/suppliers/supplier-1/pay-all'),
    );
    expect(request.request.method).toBe('POST');
    request.flush({ id: 'payment-1', status: 'APPLIED' });
  });

  it('lists pending payments filtering by status', () => {
    service.listPendingPayments().subscribe();
    const request = http.expectOne((item) => item.url.endsWith('/supplier-payments'));
    expect(request.request.params.get('status')).toBe('PENDING');
    request.flush([]);
    const details = http.expectOne((item) => item.url.endsWith('/payables/payments/history'));
    details.flush({ content: [] });
  });
});
