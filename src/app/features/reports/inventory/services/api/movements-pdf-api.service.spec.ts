import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { MovementsPdfApiService } from './movements-pdf-api.service';

describe('MovementsPdfApiService', () => {
  let service: MovementsPdfApiService;
  let httpMock: HttpTestingController;

  const mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' });

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [MovementsPdfApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(MovementsPdfApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getPdf()', () => {
    it('should GET /api/reports/inventory/movements/pdf without filters', () => {
      service.getPdf({}).subscribe((result) => {
        expect(result).toBeInstanceOf(Blob);
      });

      const req = httpMock.expectOne('/api/reports/inventory/movements/pdf');
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });

    it('should GET with warehouseId filter', () => {
      service.getPdf({ warehouseId: 'wh-001' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/movements/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('warehouseId')).toBe('wh-001');
      req.flush(mockBlob);
    });

    it('should GET with productId filter', () => {
      service.getPdf({ productId: 'prod-001' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/movements/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('productId')).toBe('prod-001');
      req.flush(mockBlob);
    });

    it('should GET with movementType filter', () => {
      service.getPdf({ movementType: 'IN' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/movements/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('movementType')).toBe('IN');
      req.flush(mockBlob);
    });

    it('should GET with date range filters', () => {
      service.getPdf({ from: '2025-01-01', to: '2025-01-31' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/movements/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('from')).toBe('2025-01-01');
      expect(req.request.params.get('to')).toBe('2025-01-31');
      req.flush(mockBlob);
    });

    it('should GET with all filters combined', () => {
      service
        .getPdf({
          warehouseId: 'wh-001',
          productId: 'prod-001',
          movementType: 'OUT',
          from: '2025-01-01',
          to: '2025-12-31',
        })
        .subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/movements/pdf' && r.method === 'GET',
      );
      expect(req.request.params.get('warehouseId')).toBe('wh-001');
      expect(req.request.params.get('productId')).toBe('prod-001');
      expect(req.request.params.get('movementType')).toBe('OUT');
      expect(req.request.params.get('from')).toBe('2025-01-01');
      expect(req.request.params.get('to')).toBe('2025-12-31');
      req.flush(mockBlob);
    });
  });
});
