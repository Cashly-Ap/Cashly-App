import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SupplierBalanceApiService } from '@features/partners/suppliers/services/api/supplier-balance-api.service';

describe('SupplierBalanceApiService', () => {
  let service: SupplierBalanceApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SupplierBalanceApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the supplier balance', () => {
    service.getBalance('supplier-1').subscribe();
    const request = http.expectOne((item) => item.url.endsWith('/suppliers/supplier-1/balance'));
    expect(request.request.method).toBe('GET');
    request.flush({ supplierId: 'supplier-1', totalBalance: 5 });
  });

  it('registers an advance against the supplier balance', () => {
    service
      .createAdvance('supplier-1', { amount: 10, paymentMethodId: 'method-1', notes: 'test' })
      .subscribe();
    const request = http.expectOne((item) =>
      item.url.endsWith('/suppliers/supplier-1/balance/advance'),
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toMatchObject({ amount: 10, paymentMethodId: 'method-1' });
    request.flush({ supplierId: 'supplier-1', totalBalance: 15 });
  });

  it('registers a refund against the supplier balance', () => {
    service.createRefund('supplier-1', { amount: 5, paymentMethodId: 'method-1' }).subscribe();
    const request = http.expectOne((item) =>
      item.url.endsWith('/suppliers/supplier-1/balance/refund'),
    );
    expect(request.request.method).toBe('POST');
    request.flush({ supplierId: 'supplier-1', totalBalance: 10 });
  });

  it('loads the supplier balance transactions with pagination', () => {
    service.getTransactions('supplier-1', 2, 20).subscribe();
    const request = http.expectOne((item) =>
      item.url.endsWith('/suppliers/supplier-1/balance/transactions'),
    );
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('size')).toBe('20');
    request.flush({ content: [] });
  });
});
