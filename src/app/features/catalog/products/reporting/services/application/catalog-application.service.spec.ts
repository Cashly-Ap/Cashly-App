import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CatalogApplicationService } from '@features/catalog/products/reporting/services/application/catalog-application.service';
import { CatalogApiService } from '@features/catalog/products/reporting/services/api/catalog-api.service';
import { of, throwError } from 'rxjs';

describe('CatalogApplicationService', () => {
  let service: CatalogApplicationService;
  let mockApi: Partial<CatalogApiService>;

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
      {
        productId: 'prod-002',
        productName: 'Generator 5KW',
        categoryName: 'Generators',
        composite: true,
        totalStock: 5,
        warehouseStocks: [],
      },
    ],
    totalElements: 2,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: false,
  };

  beforeEach(() => {
    mockApi = {
      getAll: vi.fn().mockReturnValue(of(mockPagedResponse)),
    };

    TestBed.configureTestingModule({
      providers: [CatalogApplicationService, { provide: CatalogApiService, useValue: mockApi }],
    });

    service = TestBed.inject(CatalogApplicationService);
  });

  describe('loadAll()', () => {
    it('should call api.getAll and set items signal', () => {
      service.loadAll().subscribe();

      expect(mockApi.getAll).toHaveBeenCalled();
      expect(service.items()).toHaveLength(2);
      expect(service.items()[0].productName).toBe('Motor 10HP');
      expect(service.totalElements()).toBe(2);
      expect(service.loading()).toBe(false);
    });

    it('should set loading to true during call', () => {
      service.loadAll().subscribe();
      expect(service.loading()).toBe(false);
    });

    it('should clear error before loading', () => {
      service.error.set('Previous error');
      service.loadAll().subscribe();
      expect(service.error()).toBeNull();
    });

    it('should set error on failure', () => {
      mockApi.getAll = vi.fn().mockReturnValue(throwError(() => new Error('Network error')));

      service.loadAll().subscribe({ error: () => {} });

      expect(service.error()).toBe('Network error');
      expect(service.loading()).toBe(false);
    });

    it('should pass filters to api.getAll', () => {
      service.loadAll({ search: 'motor', warehouseId: 'wh-001' }).subscribe();

      expect(mockApi.getAll).toHaveBeenCalledWith({ search: 'motor', warehouseId: 'wh-001' });
    });

    it('should handle empty content', () => {
      mockApi.getAll = vi
        .fn()
        .mockReturnValue(of({ ...mockPagedResponse, content: undefined, totalElements: 0 }));

      service.loadAll().subscribe();

      expect(service.items()).toEqual([]);
      expect(service.totalElements()).toBe(0);
    });
  });
});
