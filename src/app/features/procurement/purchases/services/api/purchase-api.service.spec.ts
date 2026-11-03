import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PurchaseApiService } from '@features/procurement/purchases/services/api/purchase-api.service';

describe('PurchaseApiService action eligibility', () => {
  let service: PurchaseApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PurchaseApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it.each(['EDIT', 'CONFIRM', 'CANCEL'] as const)(
    'asks the backend for eligible %s purchases',
    (action) => {
      service.getAll({ action, search: 'PO' }).subscribe();
      const request = http.expectOne((req) => req.url === '/api/purchases');
      expect(request.request.params.get('action')).toBe(action);
      expect(request.request.params.get('search')).toBe('PO');
      expect(request.request.params.has('status')).toBe(false);
      request.flush([]);
    },
  );

  it('preserves the regular list without an action filter', () => {
    service.getAll({ status: 'DRAFT' }).subscribe();
    const request = http.expectOne((req) => req.url === '/api/purchases');
    expect(request.request.params.has('action')).toBe(false);
    expect(request.request.params.get('status')).toBe('DRAFT');
    request.flush([]);
  });
});
