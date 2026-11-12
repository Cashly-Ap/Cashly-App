import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CashRegisterApiService } from '@features/finance/treasury/cash-register/services/api/cash-register-api.service';
import { environment } from '@env/environment';

describe('CashRegisterApiService', () => {
  let service: CashRegisterApiService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/cash-register`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CashRegisterApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CashRegisterApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('opens a session with its opening balance', () => {
    service.open({ openedByName: 'Operator', openingBalance: 125 }).subscribe();

    const request = http.expectOne(`${baseUrl}/open`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ openedByName: 'Operator', openingBalance: 125 });
    request.flush({});
  });

  it('requests detailed history explicitly', () => {
    service.getHistory(0, 10, undefined, undefined, 'openedAt,desc', 'DETAILED').subscribe();

    const request = http.expectOne((candidate) => candidate.url === `${baseUrl}/history`);
    expect(request.request.params.get('detailed')).toBe('true');
    expect(request.request.params.get('sort')).toBe('openedAt,desc');
    request.flush({ content: [] });
  });

  it('loads a single detailed session by register id', () => {
    service.getSession('register-1').subscribe();

    const request = http.expectOne((candidate) => candidate.url === `${baseUrl}/history`);
    expect(request.request.params.get('registerId')).toBe('register-1');
    expect(request.request.params.get('detailed')).toBe('true');
    expect(request.request.params.get('size')).toBe('1');
    request.flush({ content: [] });
  });

  it('downloads a simple PDF for a selected session', () => {
    service.exportSession('register-1', 'PDF', 'SIMPLE').subscribe();

    const request = http.expectOne((candidate) => candidate.url === `${baseUrl}/register-1/report`);
    expect(request.request.responseType).toBe('blob');
    expect(request.request.params.get('format')).toBe('PDF');
    expect(request.request.params.get('type')).toBe('SIMPLE');
    request.flush(new Blob());
  });

  it('downloads a filtered grouped cash report', () => {
    service
      .exportReport({
        dateFrom: '2026-08-01',
        dateTo: '2026-08-31',
        format: 'PDF',
        type: 'GROUPED',
        customerId: 'customer-1',
        productId: 'product-1',
        categoryId: 'category-1',
      })
      .subscribe();

    const request = http.expectOne((candidate) => candidate.url === `${baseUrl}/reports`);
    expect(request.request.responseType).toBe('blob');
    expect(request.request.params.get('format')).toBe('PDF');
    expect(request.request.params.get('type')).toBe('GROUPED');
    expect(request.request.params.get('customerId')).toBe('customer-1');
    expect(request.request.params.get('productId')).toBe('product-1');
    expect(request.request.params.get('categoryId')).toBe('category-1');
    request.flush(new Blob());
  });
});
