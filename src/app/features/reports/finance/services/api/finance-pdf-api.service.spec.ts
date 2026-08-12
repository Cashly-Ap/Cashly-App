import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FinancePdfApiService } from '@features/reports/finance/services/api/finance-pdf-api.service';

describe('FinancePdfApiService', () => {
  let service: FinancePdfApiService;
  let httpMock: HttpTestingController;

  const mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' });

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [FinancePdfApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(FinancePdfApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getPaymentPdf()', () => {
    it('should GET /api/reports/finance/payments/:id/pdf', () => {
      service.getPaymentPdf('pay-001').subscribe();

      const req = httpMock.expectOne('/api/reports/finance/payments/pay-001/pdf');
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
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

  describe('getPaymentHistoryPdf()', () => {
    it('should GET /api/reports/finance/payment-history/pdf without filters', () => {
      service.getPaymentHistoryPdf({}).subscribe();

      const req = httpMock.expectOne('/api/reports/finance/payment-history/pdf');
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });

    it('should GET with dateFrom filter', () => {
      service.getPaymentHistoryPdf({ dateFrom: '2025-01-01' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/finance/payment-history/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('dateFrom')).toBe('2025-01-01');
      req.flush(mockBlob);
    });

    it('should GET with dateTo filter', () => {
      service.getPaymentHistoryPdf({ dateTo: '2025-12-31' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/finance/payment-history/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('dateTo')).toBe('2025-12-31');
      req.flush(mockBlob);
    });

    it('should GET with customerId filter', () => {
      service.getPaymentHistoryPdf({ customerId: 'c1' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/finance/payment-history/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('customerId')).toBe('c1');
      req.flush(mockBlob);
    });

    it('should GET with type filter', () => {
      service.getPaymentHistoryPdf({ type: 'CASH' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/finance/payment-history/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('type')).toBe('CASH');
      req.flush(mockBlob);
    });

    it('should GET with method filter', () => {
      service.getPaymentHistoryPdf({ method: 'BANK_TRANSFER' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/finance/payment-history/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('method')).toBe('BANK_TRANSFER');
      req.flush(mockBlob);
    });

    it('should GET with all filters combined', () => {
      service
        .getPaymentHistoryPdf({
          dateFrom: '2025-01-01',
          dateTo: '2025-12-31',
          customerId: 'c1',
          type: 'CASH',
          method: 'BANK_TRANSFER',
        })
        .subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/finance/payment-history/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('dateFrom')).toBe('2025-01-01');
      expect(req.request.params.get('dateTo')).toBe('2025-12-31');
      expect(req.request.params.get('customerId')).toBe('c1');
      expect(req.request.params.get('type')).toBe('CASH');
      expect(req.request.params.get('method')).toBe('BANK_TRANSFER');
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
