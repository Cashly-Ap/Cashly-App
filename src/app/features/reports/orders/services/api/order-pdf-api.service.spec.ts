import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { OrderPdfApiService } from './order-pdf-api.service';

describe('OrderPdfApiService', () => {
  let service: OrderPdfApiService;
  let httpMock: HttpTestingController;

  const mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' });

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [OrderPdfApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(OrderPdfApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('downloadOrderPdf()', () => {
    it('should GET /api/reports/orders/:id/pdf', () => {
      service.downloadOrderPdf('ord-001').subscribe();

      const req = httpMock.expectOne('/api/reports/orders/ord-001/pdf');
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });

  describe('downloadOrdersReportPdf()', () => {
    it('should GET /api/reports/orders/pdf without filters', () => {
      service.downloadOrdersReportPdf({}).subscribe((result) => {
        expect(result).toBeInstanceOf(Blob);
      });

      const req = httpMock.expectOne('/api/reports/orders/pdf');
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });

    it('should GET with dateFrom filter', () => {
      service.downloadOrdersReportPdf({ dateFrom: '2025-01-01' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/orders/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('dateFrom')).toBe('2025-01-01');
      req.flush(mockBlob);
    });

    it('should GET with dateTo filter', () => {
      service.downloadOrdersReportPdf({ dateTo: '2025-12-31' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/orders/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('dateTo')).toBe('2025-12-31');
      req.flush(mockBlob);
    });

    it('should GET with customerId filter', () => {
      service.downloadOrdersReportPdf({ customerId: 'c1' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/orders/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('customerId')).toBe('c1');
      req.flush(mockBlob);
    });

    it('should GET with status filter', () => {
      service.downloadOrdersReportPdf({ status: 'DRAFT' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/orders/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('status')).toBe('DRAFT');
      req.flush(mockBlob);
    });

    it('should GET with productId filter', () => {
      service.downloadOrdersReportPdf({ productId: 'prod-001' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/orders/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('productId')).toBe('prod-001');
      req.flush(mockBlob);
    });

    it('should GET with categoryId filter', () => {
      service.downloadOrdersReportPdf({ categoryId: 'cat-001' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/orders/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('categoryId')).toBe('cat-001');
      req.flush(mockBlob);
    });

    it('should GET with mode filter', () => {
      service.downloadOrdersReportPdf({ mode: 'DETAILED' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/orders/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('mode')).toBe('DETAILED');
      req.flush(mockBlob);
    });

    it('should GET with all filters combined', () => {
      service
        .downloadOrdersReportPdf({
          dateFrom: '2025-01-01',
          dateTo: '2025-12-31',
          customerId: 'c1',
          status: 'CONFIRMED',
          productId: 'prod-001',
          categoryId: 'cat-001',
          mode: 'SIMPLE',
        })
        .subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/orders/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('dateFrom')).toBe('2025-01-01');
      expect(req.request.params.get('dateTo')).toBe('2025-12-31');
      expect(req.request.params.get('customerId')).toBe('c1');
      expect(req.request.params.get('status')).toBe('CONFIRMED');
      expect(req.request.params.get('productId')).toBe('prod-001');
      expect(req.request.params.get('categoryId')).toBe('cat-001');
      expect(req.request.params.get('mode')).toBe('SIMPLE');
      req.flush(mockBlob);
    });
  });
});
