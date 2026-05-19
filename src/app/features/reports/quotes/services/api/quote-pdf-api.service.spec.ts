import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { QuotePdfApiService } from './quote-pdf-api.service';

describe('QuotePdfApiService', () => {
  let service: QuotePdfApiService;
  let httpMock: HttpTestingController;

  const mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' });

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [QuotePdfApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(QuotePdfApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('downloadQuotePdf()', () => {
    it('should GET /api/reports/quotes/:id/pdf', () => {
      service.downloadQuotePdf('quote-001').subscribe();

      const req = httpMock.expectOne('/api/reports/quotes/quote-001/pdf');
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });

  describe('downloadQuotesReportPdf()', () => {
    it('should GET /api/reports/quotes/pdf without filters', () => {
      service.downloadQuotesReportPdf({}).subscribe((result) => {
        expect(result).toBeInstanceOf(Blob);
      });

      const req = httpMock.expectOne('/api/reports/quotes/pdf');
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });

    it('should GET with dateFrom filter', () => {
      service.downloadQuotesReportPdf({ dateFrom: '2025-01-01' }).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/reports/quotes/pdf' && r.method === 'GET');
      expect(req.request.params.get('dateFrom')).toBe('2025-01-01');
      req.flush(mockBlob);
    });

    it('should GET with dateTo filter', () => {
      service.downloadQuotesReportPdf({ dateTo: '2025-12-31' }).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/reports/quotes/pdf' && r.method === 'GET');
      expect(req.request.params.get('dateTo')).toBe('2025-12-31');
      req.flush(mockBlob);
    });

    it('should GET with customerId filter', () => {
      service.downloadQuotesReportPdf({ customerId: 'c1' }).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/reports/quotes/pdf' && r.method === 'GET');
      expect(req.request.params.get('customerId')).toBe('c1');
      req.flush(mockBlob);
    });

    it('should GET with status filter', () => {
      service.downloadQuotesReportPdf({ status: 'DRAFT' }).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/reports/quotes/pdf' && r.method === 'GET');
      expect(req.request.params.get('status')).toBe('DRAFT');
      req.flush(mockBlob);
    });

    it('should GET with productId filter', () => {
      service.downloadQuotesReportPdf({ productId: 'prod-001' }).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/reports/quotes/pdf' && r.method === 'GET');
      expect(req.request.params.get('productId')).toBe('prod-001');
      req.flush(mockBlob);
    });

    it('should GET with categoryId filter', () => {
      service.downloadQuotesReportPdf({ categoryId: 'cat-001' }).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/reports/quotes/pdf' && r.method === 'GET');
      expect(req.request.params.get('categoryId')).toBe('cat-001');
      req.flush(mockBlob);
    });

    it('should GET with mode filter', () => {
      service.downloadQuotesReportPdf({ mode: 'DETAILED' }).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/reports/quotes/pdf' && r.method === 'GET');
      expect(req.request.params.get('mode')).toBe('DETAILED');
      req.flush(mockBlob);
    });

    it('should GET with all filters combined', () => {
      service.downloadQuotesReportPdf({
        dateFrom: '2025-01-01',
        dateTo: '2025-12-31',
        customerId: 'c1',
        status: 'SENT',
        productId: 'prod-001',
        categoryId: 'cat-001',
        mode: 'SIMPLE',
      }).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/reports/quotes/pdf' && r.method === 'GET');
      expect(req.request.params.get('dateFrom')).toBe('2025-01-01');
      expect(req.request.params.get('dateTo')).toBe('2025-12-31');
      expect(req.request.params.get('customerId')).toBe('c1');
      expect(req.request.params.get('status')).toBe('SENT');
      expect(req.request.params.get('productId')).toBe('prod-001');
      expect(req.request.params.get('categoryId')).toBe('cat-001');
      expect(req.request.params.get('mode')).toBe('SIMPLE');
      req.flush(mockBlob);
    });
  });
});
