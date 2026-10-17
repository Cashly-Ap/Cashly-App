import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CatalogApiService } from '@features/catalog/products/reporting/services/api/catalog-api.service';

describe('CatalogApiService', () => {
  let service: CatalogApiService;
  let httpMock: HttpTestingController;

  const mockPagedResponse = {
    content: [
      {
        productId: 'prod-001',
        productName: 'Motor 10HP',
        categoryName: 'Motors',
        composite: false,
        totalStock: 100,
        warehouseStocks: [{ warehouseId: 'wh-001', warehouseName: 'Central', quantity: 100 }],
      },
    ],
    totalElements: 1,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: false,
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [CatalogApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CatalogApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAll()', () => {
    it('should GET /api/reports/inventory/catalog without filters', () => {
      service.getAll().subscribe((result) => {
        expect(result.content).toHaveLength(1);
        expect(result.totalElements).toBe(1);
      });

      const req = httpMock.expectOne('/api/reports/inventory/catalog');
      expect(req.request.method).toBe('GET');
      req.flush(mockPagedResponse);
    });

    it('should GET with search filter', () => {
      service.getAll({ search: 'motor' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/catalog' && r.method === 'GET',
      );
      expect(req.request.params.get('search')).toBe('motor');
      req.flush(mockPagedResponse);
    });

    it('should GET with categoryId filter', () => {
      service.getAll({ categoryId: 'cat-001' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/catalog' && r.method === 'GET',
      );
      expect(req.request.params.get('categoryId')).toBe('cat-001');
      req.flush(mockPagedResponse);
    });

    it('should GET with warehouseId filter', () => {
      service.getAll({ warehouseId: 'wh-001' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/catalog' && r.method === 'GET',
      );
      expect(req.request.params.get('warehouseId')).toBe('wh-001');
      req.flush(mockPagedResponse);
    });

    it('should GET with composite flag', () => {
      service.getAll({ composite: true }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/catalog' && r.method === 'GET',
      );
      expect(req.request.params.get('composite')).toBe('true');
      req.flush(mockPagedResponse);
    });

    it('should GET with composite=false flag', () => {
      service.getAll({ composite: false }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/catalog' && r.method === 'GET',
      );
      expect(req.request.params.get('composite')).toBe('false');
      req.flush(mockPagedResponse);
    });

    it('should GET with withStock flag', () => {
      service.getAll({ withStock: true }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/catalog' && r.method === 'GET',
      );
      expect(req.request.params.get('withStock')).toBe('true');
      req.flush(mockPagedResponse);
    });

    it('should GET with lowStock flag', () => {
      service.getAll({ lowStock: true }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/catalog' && r.method === 'GET',
      );
      expect(req.request.params.get('lowStock')).toBe('true');
      req.flush(mockPagedResponse);
    });

    it('should GET with pagination params', () => {
      service.getAll({ page: 2, size: 25 }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/catalog' && r.method === 'GET',
      );
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('size')).toBe('25');
      req.flush(mockPagedResponse);
    });

    it('should GET with all filters combined', () => {
      service
        .getAll({
          search: 'generator',
          categoryId: 'cat-002',
          warehouseId: 'wh-002',
          composite: false,
          withStock: true,
          lowStock: false,
          page: 0,
          size: 10,
        })
        .subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/catalog' && r.method === 'GET',
      );
      expect(req.request.params.get('search')).toBe('generator');
      expect(req.request.params.get('categoryId')).toBe('cat-002');
      expect(req.request.params.get('warehouseId')).toBe('wh-002');
      expect(req.request.params.get('composite')).toBe('false');
      expect(req.request.params.get('withStock')).toBe('true');
      expect(req.request.params.get('lowStock')).toBe('false');
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('10');
      req.flush(mockPagedResponse);
    });
  });
});
