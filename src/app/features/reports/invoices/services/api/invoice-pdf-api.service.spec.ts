import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { InvoicePdfApiService } from '@features/reports/invoices/services/api/invoice-pdf-api.service';

describe('InvoicePdfApiService', () => {
  let service: InvoicePdfApiService;
  let httpMock: HttpTestingController;

  const mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' });

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [InvoicePdfApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(InvoicePdfApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('downloadInvoicesReportPdf()', () => {
    it('should GET /api/reports/invoices/pdf without filters', () => {
      service.downloadInvoicesReportPdf({}).subscribe((result) => {
        expect(result).toBeInstanceOf(Blob);
      });

      const req = httpMock.expectOne('/api/reports/invoices/pdf');
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });

    it('should GET with dateFrom filter', () => {
      service.downloadInvoicesReportPdf({ dateFrom: '2025-01-01' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/invoices/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('dateFrom')).toBe('2025-01-01');
      req.flush(mockBlob);
    });

    it('should GET with dateTo filter', () => {
      service.downloadInvoicesReportPdf({ dateTo: '2025-12-31' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/invoices/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('dateTo')).toBe('2025-12-31');
      req.flush(mockBlob);
    });

    it('should GET with customerId filter', () => {
      service.downloadInvoicesReportPdf({ customerId: 'c1' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/invoices/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('customerId')).toBe('c1');
      req.flush(mockBlob);
    });

    it('should GET with status filter', () => {
      service.downloadInvoicesReportPdf({ status: 'DRAFT' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/invoices/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('status')).toBe('DRAFT');
      req.flush(mockBlob);
    });

    it('should GET with productId filter', () => {
      service.downloadInvoicesReportPdf({ productId: 'prod-001' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/invoices/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('productId')).toBe('prod-001');
      req.flush(mockBlob);
    });

    it('should GET with categoryId filter', () => {
      service.downloadInvoicesReportPdf({ categoryId: 'cat-001' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/invoices/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('categoryId')).toBe('cat-001');
      req.flush(mockBlob);
    });

    it('should GET with mode filter', () => {
      service.downloadInvoicesReportPdf({ mode: 'DETAILED' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/invoices/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('mode')).toBe('DETAILED');
      req.flush(mockBlob);
    });

    it('should GET with all filters combined', () => {
      service
        .downloadInvoicesReportPdf({
          dateFrom: '2025-01-01',
          dateTo: '2025-12-31',
          customerId: 'c1',
          status: 'PAID',
          productId: 'prod-001',
          categoryId: 'cat-001',
          mode: 'SIMPLE',
        })
        .subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/invoices/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('dateFrom')).toBe('2025-01-01');
      expect(req.request.params.get('dateTo')).toBe('2025-12-31');
      expect(req.request.params.get('customerId')).toBe('c1');
      expect(req.request.params.get('status')).toBe('PAID');
      expect(req.request.params.get('productId')).toBe('prod-001');
      expect(req.request.params.get('categoryId')).toBe('cat-001');
      expect(req.request.params.get('mode')).toBe('SIMPLE');
      req.flush(mockBlob);
    });
  });

  describe('downloadInvoicePdf()', () => {
    it('should GET /api/reports/invoices/:id/pdf', () => {
      service.downloadInvoicePdf('inv-001').subscribe();

      const req = httpMock.expectOne('/api/reports/invoices/inv-001/pdf');
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });
});
