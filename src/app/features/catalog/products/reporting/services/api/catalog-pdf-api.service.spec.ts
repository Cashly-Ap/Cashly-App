import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CatalogPdfApiService } from '@features/catalog/products/reporting/services/api/catalog-pdf-api.service';

describe('CatalogPdfApiService', () => {
  let service: CatalogPdfApiService;
  let httpMock: HttpTestingController;

  const mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' });

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [CatalogPdfApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CatalogPdfApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('downloadPdf()', () => {
    it('should GET /api/reports/inventory/catalog/pdf without filters', () => {
      service.downloadPdf({}).subscribe((result) => {
        expect(result).toBeInstanceOf(Blob);
      });

      const req = httpMock.expectOne('/api/reports/inventory/catalog/pdf');
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });

    it('should GET with search filter', () => {
      service.downloadPdf({ search: 'motor' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/catalog/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('search')).toBe('motor');
      req.flush(mockBlob);
    });

    it('should GET with categoryId filter', () => {
      service.downloadPdf({ categoryId: 'cat-001' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/catalog/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('categoryId')).toBe('cat-001');
      req.flush(mockBlob);
    });

    it('should GET with warehouseId filter', () => {
      service.downloadPdf({ warehouseId: 'wh-001' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/catalog/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('warehouseId')).toBe('wh-001');
      req.flush(mockBlob);
    });

    it('should GET with withStock flag', () => {
      service.downloadPdf({ withStock: true }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/catalog/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('withStock')).toBe('true');
      req.flush(mockBlob);
    });

    it('should GET with all filters combined', () => {
      service
        .downloadPdf({
          search: 'generator',
          categoryId: 'cat-002',
          warehouseId: 'wh-002',
          withStock: false,
        })
        .subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/catalog/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('search')).toBe('generator');
      expect(req.request.params.get('categoryId')).toBe('cat-002');
      expect(req.request.params.get('warehouseId')).toBe('wh-002');
      expect(req.request.params.get('withStock')).toBe('false');
      req.flush(mockBlob);
    });
  });
});
