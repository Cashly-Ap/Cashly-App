import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ReceivablesPdfApiService } from '@features/finance/treasury/receivables/reporting/services/api/receivables-pdf-api.service';

describe('ReceivablesPdfApiService', () => {
  let service: ReceivablesPdfApiService;
  let httpMock: HttpTestingController;

  const mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' });

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [ReceivablesPdfApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ReceivablesPdfApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAccountsReceivablePdf()', () => {
    it('should GET /api/reports/finance/accounts-receivable/pdf without filters', () => {
      service.getAccountsReceivablePdf({}).subscribe();

      const req = httpMock.expectOne('/api/reports/finance/accounts-receivable/pdf');
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });

    it('should GET with customerId filter', () => {
      service.getAccountsReceivablePdf({ customerId: 'c1' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/finance/accounts-receivable/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('customerId')).toBe('c1');
      req.flush(mockBlob);
    });

    it('should GET with overdueOnly filter', () => {
      service.getAccountsReceivablePdf({ overdueOnly: true }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/finance/accounts-receivable/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('overdueOnly')).toBe('true');
      req.flush(mockBlob);
    });

    it('should GET with all filters combined', () => {
      service.getAccountsReceivablePdf({ customerId: 'c1', overdueOnly: true }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/finance/accounts-receivable/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('customerId')).toBe('c1');
      expect(req.request.params.get('overdueOnly')).toBe('true');
      req.flush(mockBlob);
    });
  });

  describe('getCollectionsPdf()', () => {
    it('should GET /api/reports/finance/collections/pdf without filters', () => {
      service.getCollectionsPdf({}).subscribe();

      const req = httpMock.expectOne('/api/reports/finance/collections/pdf');
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });

    it('should GET with customerId filter', () => {
      service.getCollectionsPdf({ customerId: 'c1' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/finance/collections/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('customerId')).toBe('c1');
      req.flush(mockBlob);
    });

    it('should GET with agingFrom filter', () => {
      service.getCollectionsPdf({ agingFrom: '2025-01-01' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/finance/collections/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('agingFrom')).toBe('2025-01-01');
      req.flush(mockBlob);
    });

    it('should GET with all filters combined', () => {
      service.getCollectionsPdf({ customerId: 'c1', agingFrom: '2025-01-01' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/finance/collections/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('customerId')).toBe('c1');
      expect(req.request.params.get('agingFrom')).toBe('2025-01-01');
      req.flush(mockBlob);
    });
  });
});
