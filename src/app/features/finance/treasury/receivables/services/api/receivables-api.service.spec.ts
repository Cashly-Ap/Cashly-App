import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ReceivablesApiService } from '@features/finance/treasury/receivables/services/api/receivables-api.service';

describe('Receivables action queries', () => {
  let service: ReceivablesApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReceivablesApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it.each(['PAY_ALL', 'PAY_PARTIAL', 'REFUND'] as const)(
    'sends %s to the server before customer pagination',
    (action) => {
      service.searchCustomersWithDebt({ action, page: 2, size: 10, search: 'Client' }).subscribe();
      const request = http.expectOne((request) => request.url.endsWith('/receivables/customers'));
      expect(request.request.params.get('action')).toBe(action);
      expect(request.request.params.get('page')).toBe('2');
      expect(request.request.params.get('search')).toBe('Client');
      request.flush({ content: [] });
    },
  );

  it('does not restrict the regular customer list', () => {
    service.searchCustomersWithDebt({ page: 0 }).subscribe();
    const request = http.expectOne((request) => request.url.endsWith('/receivables/customers'));
    expect(request.request.params.has('action')).toBe(false);
    request.flush({ content: [] });
  });
});
