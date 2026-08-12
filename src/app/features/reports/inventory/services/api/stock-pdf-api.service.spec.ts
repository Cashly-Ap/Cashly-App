import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { StockPdfApiService } from '@features/reports/inventory/services/api/stock-pdf-api.service';

describe('StockPdfApiService', () => {
  let service: StockPdfApiService;
  let httpMock: HttpTestingController;

  const mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' });

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [StockPdfApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(StockPdfApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getPdf()', () => {
    it('should GET /api/reports/inventory/stock/pdf without filters', () => {
      service.getPdf({}).subscribe((result) => {
        expect(result).toBeInstanceOf(Blob);
      });

      const req = httpMock.expectOne('/api/reports/inventory/stock/pdf');
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });

    it('should GET with warehouseId filter', () => {
      service.getPdf({ warehouseId: 'wh-001' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/stock/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('warehouseId')).toBe('wh-001');
      req.flush(mockBlob);
    });

    it('should GET with categoryId filter', () => {
      service.getPdf({ categoryId: 'cat-001' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/stock/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('categoryId')).toBe('cat-001');
      req.flush(mockBlob);
    });

    it('should GET with withStock flag', () => {
      service.getPdf({ withStock: true }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/stock/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('withStock')).toBe('true');
      req.flush(mockBlob);
    });

    it('should GET with lowStock flag', () => {
      service.getPdf({ lowStock: true }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/stock/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('lowStock')).toBe('true');
      req.flush(mockBlob);
    });

    it('should GET with all filters combined', () => {
      service
        .getPdf({
          warehouseId: 'wh-001',
          categoryId: 'cat-002',
          withStock: false,
          lowStock: true,
        })
        .subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/stock/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('warehouseId')).toBe('wh-001');
      expect(req.request.params.get('categoryId')).toBe('cat-002');
      expect(req.request.params.get('withStock')).toBe('false');
      expect(req.request.params.get('lowStock')).toBe('true');
      req.flush(mockBlob);
    });
  });
});
