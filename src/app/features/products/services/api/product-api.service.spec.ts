import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProductApiService, ProductFilters } from './product-api.service';
import { ProductList, ProductDetails, ProductCreate, ProductUpdate, ProductStockByWarehouse } from '../../models/interfaces';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

describe('ProductApiService', () => {
  let service: ProductApiService;
  let httpMock: HttpTestingController;

  const mockList: ProductList[] = [
    {
      id: 'prod-001',
      code: 'PROD-001',
      name: 'Test Product',
      categoryId: 'cat-001',
      categoryName: 'Test Category',
      composite: false,
      active: true,
      purchasePrice: 60,
      productPrices: [{ priceTypeId: 'pt-001', price: 100 }],
      stockTotal: 50,
    },
  ];

  const mockDetails: ProductDetails = {
    id: 'prod-001',
    code: 'PROD-001',
    name: 'Test Product',
    categoryId: 'cat-001',
    categoryName: 'Test Category',
    composite: false,
    photo: null,
    purchasePrice: 60,
    description: 'Test description',
    active: true,
    stockTotal: 50,
    components: [],
    productPrices: [{ id: 'pp-001', priceTypeId: 'pt-001', priceTypeName: 'Retail', price: 100, profitMargin: 40 }],
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T10:30:00Z',
  };

  const mockPagedResponse = (items: ProductList[]): PagedResponse<ProductList> => ({
    content: items,
    totalElements: items.length,
    totalPages: 1,
    size: 20,
    number: 0,
  });

  const mockStock: ProductStockByWarehouse[] = [
    { warehouseId: 'wh-001', warehouseName: 'Main Warehouse', quantity: 30, lastMovementAt: '2025-01-15T10:30:00Z' },
    { warehouseId: 'wh-002', warehouseName: 'Secondary Warehouse', quantity: 20, lastMovementAt: null },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ProductApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAll()', () => {
    it('should GET /api/products and return paged response', () => {
      service.getAll().subscribe((result) => {
        expect(result.content).toEqual(mockList);
        expect(result.totalElements).toBe(1);
      });

      const req = httpMock.expectOne('/api/products');
      expect(req.request.method).toBe('GET');
      req.flush(mockPagedResponse(mockList));
    });

    it('should pass filters as query params', () => {
      const filters: ProductFilters = {
        search: 'test',
        categoryId: 'cat-001',
        composite: false,
        active: true,
        page: 1,
        size: 10,
        orderBy: 'name',
        orderDir: 'asc',
      };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((request) => request.url === '/api/products');
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('search')).toBe('test');
      expect(req.request.params.get('categoryId')).toBe('cat-001');
      expect(req.request.params.get('composite')).toBe('false');
      expect(req.request.params.get('active')).toBe('true');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('size')).toBe('10');
      expect(req.request.params.get('orderBy')).toBe('name');
      expect(req.request.params.get('orderDir')).toBe('asc');
      req.flush(mockPagedResponse(mockList));
    });

    it('should handle empty content', () => {
      service.getAll().subscribe((result) => {
        expect(result.content).toEqual([]);
        expect(result.totalElements).toBe(0);
      });

      const req = httpMock.expectOne('/api/products');
      req.flush(mockPagedResponse([]));
    });
  });

  describe('getAllSimple()', () => {
    it('should GET /api/products with size=1000 and active=true, return array', () => {
      service.getAllSimple().subscribe((result) => {
        expect(result).toEqual(mockList);
      });

      const req = httpMock.expectOne(
        (request) =>
          request.url === '/api/products' &&
          request.method === 'GET' &&
          request.params.get('size') === '1000' &&
          request.params.get('active') === 'true',
      );
      req.flush(mockPagedResponse(mockList));
    });

    it('should return empty array when content is null', () => {
      service.getAllSimple().subscribe((result) => {
        expect(result).toEqual([]);
      });

      const req = httpMock.expectOne(
        (request) =>
          request.url === '/api/products' &&
          request.params.get('size') === '1000' &&
          request.params.get('active') === 'true',
      );
      req.flush({ content: null, totalElements: 0, totalPages: 0, size: 1000, number: 0 });
    });
  });

  describe('getById()', () => {
    it('should GET /api/products/:id and return details', () => {
      service.getById('prod-001').subscribe((result) => {
        expect(result).toEqual(mockDetails);
      });

      const req = httpMock.expectOne('/api/products/prod-001');
      expect(req.request.method).toBe('GET');
      req.flush(mockDetails);
    });
  });

  describe('create()', () => {
    it('should POST /api/products with data and return details', () => {
      const createData: ProductCreate = {
        name: 'New Product',
        categoryId: 'cat-001',
        description: 'New description',
        composite: false,
        purchasePrice: 80,
        productPrices: [{ priceTypeId: 'pt-001', price: 150, profitMargin: 46.67 }],
      };

      service.create(createData).subscribe((result) => {
        expect(result).toEqual(mockDetails);
      });

      const req = httpMock.expectOne('/api/products');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createData);
      req.flush(mockDetails);
    });
  });

  describe('update()', () => {
    it('should PUT /api/products/:id with data and return details', () => {
      const updateData: ProductUpdate = {
        name: 'Updated Product',
        categoryId: 'cat-001',
        description: 'Updated description',
        purchasePrice: 100,
        productPrices: [{ priceTypeId: 'pt-001', price: 200, profitMargin: 50 }],
      };

      service.update('prod-001', updateData).subscribe((result) => {
        expect(result).toEqual(mockDetails);
      });

      const req = httpMock.expectOne('/api/products/prod-001');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockDetails);
    });
  });

  describe('toggleActive()', () => {
    it('should PATCH /api/products/:id/active with active=true', () => {
      const toggledDetails = { ...mockDetails, active: false };

      service.toggleActive('prod-001', false).subscribe((result) => {
        expect(result.active).toBe(false);
      });

      const req = httpMock.expectOne('/api/products/prod-001/active');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ active: false });
      req.flush(toggledDetails);
    });

    it('should PATCH /api/products/:id/active with active=true', () => {
      const toggledDetails = { ...mockDetails, active: true };

      service.toggleActive('prod-001', true).subscribe((result) => {
        expect(result.active).toBe(true);
      });

      const req = httpMock.expectOne('/api/products/prod-001/active');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ active: true });
      req.flush(toggledDetails);
    });
  });

  describe('delete()', () => {
    it('should DELETE /api/products/:id', () => {
      service.delete('prod-001').subscribe();

      const req = httpMock.expectOne('/api/products/prod-001');
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });

  describe('getStock()', () => {
    it('should GET /api/products/:id/stock and return stock by warehouse', () => {
      service.getStock('prod-001').subscribe((result) => {
        expect(result).toEqual(mockStock);
        expect(result).toHaveLength(2);
      });

      const req = httpMock.expectOne('/api/products/prod-001/stock');
      expect(req.request.method).toBe('GET');
      req.flush(mockStock);
    });
  });
});
