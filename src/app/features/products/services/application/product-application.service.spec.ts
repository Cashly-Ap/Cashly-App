import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProductApplicationService } from '@features/products/services/application/product-application.service';
import {
  ProductApiService,
  ProductFilters,
} from '@features/products/services/api/product-api.service';
import {
  ProductList,
  ProductDetails,
  ProductCreate,
  ProductUpdate,
  ProductStockByWarehouse,
} from '@features/products/models/interfaces';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

describe('ProductApplicationService', () => {
  let service: ProductApplicationService;
  let mockApiService: {
    getAll: ReturnType<typeof vi.fn>;
    getAllSimple: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    toggleActive: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    getStock: ReturnType<typeof vi.fn>;
  };

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
    productPrices: [
      {
        id: 'pp-001',
        priceTypeId: 'pt-001',
        priceTypeName: 'Retail',
        price: 100,
        profitMargin: 40,
      },
    ],
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T10:30:00Z',
  };

  const mockListItem: ProductList = {
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
  };

  const mockPagedResponse = (items: ProductList[]): PagedResponse<ProductList> => ({
    content: items,
    totalElements: items.length,
    totalPages: 1,
    size: 20,
    number: 0,
  });

  const mockStock: ProductStockByWarehouse[] = [
    {
      warehouseId: 'wh-001',
      warehouseName: 'Main Warehouse',
      quantity: 30,
      lastMovementAt: '2025-01-15T10:30:00Z',
    },
  ];

  beforeEach(() => {
    mockApiService = {
      getAll: vi.fn(),
      getAllSimple: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      toggleActive: vi.fn(),
      delete: vi.fn(),
      getStock: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ProductApplicationService,
        { provide: ProductApiService, useValue: mockApiService },
      ],
    });

    service = TestBed.inject(ProductApplicationService);
  });

  describe('initial state', () => {
    it('should have empty products array initially', () => {
      expect(service.products()).toEqual([]);
    });

    it('should have empty simpleProducts array initially', () => {
      expect(service.simpleProducts()).toEqual([]);
    });

    it('should have null currentProduct initially', () => {
      expect(service.currentProduct()).toBeNull();
    });

    it('should not be loading initially', () => {
      expect(service.loading()).toBe(false);
    });

    it('should have null error initially', () => {
      expect(service.error()).toBeNull();
    });

    it('should have totalElements 0 initially', () => {
      expect(service.totalElements()).toBe(0);
    });
  });

  describe('loadAll()', () => {
    it('should load products and update signals', () => {
      mockApiService.getAll.mockReturnValue(of(mockPagedResponse([mockListItem])));

      service.loadAll().subscribe(() => {
        expect(service.products()).toHaveLength(1);
        expect(service.products()[0].id).toBe('prod-001');
        expect(service.totalElements()).toBe(1);
      });

      expect(service.loading()).toBe(false);
    });

    it('should set error on failure', () => {
      mockApiService.getAll.mockReturnValue(throwError(() => new Error('Network error')));

      service.loadAll().subscribe({
        error: () => {
          expect(service.error()).toBe('Network error');
        },
      });

      expect(service.loading()).toBe(false);
    });

    it('should clear previous error before loading', () => {
      mockApiService.getAll.mockReturnValue(of(mockPagedResponse([mockListItem])));

      service.loadAll().subscribe(() => {
        expect(service.error()).toBeNull();
      });
    });

    it('should pass filters to API', () => {
      mockApiService.getAll.mockReturnValue(of(mockPagedResponse([])));

      const filters: ProductFilters = { search: 'test', active: true };
      service.loadAll(filters).subscribe();

      expect(mockApiService.getAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('loadSimpleProducts()', () => {
    it('should load simple products and update signal', () => {
      mockApiService.getAllSimple.mockReturnValue(of([mockListItem]));

      service.loadSimpleProducts().subscribe(() => {
        expect(service.simpleProducts()).toHaveLength(1);
        expect(service.simpleProducts()[0].id).toBe('prod-001');
      });
    });
  });

  describe('loadById()', () => {
    it('should load product by id and update currentProduct signal', () => {
      mockApiService.getById.mockReturnValue(of(mockDetails));

      service.loadById('prod-001').subscribe((product) => {
        expect(product.id).toBe('prod-001');
        expect(service.currentProduct()?.id).toBe('prod-001');
      });

      expect(service.loading()).toBe(false);
    });

    it('should set error when product not found', () => {
      mockApiService.getById.mockReturnValue(throwError(() => new Error('Not found')));

      service.loadById('prod-999').subscribe({
        error: () => {
          expect(service.error()).toBe('Not found');
        },
      });

      expect(service.loading()).toBe(false);
    });
  });

  describe('create()', () => {
    it('should create product', () => {
      mockApiService.create.mockReturnValue(of(mockDetails));

      const createData: ProductCreate = {
        name: 'New Product',
        categoryId: 'cat-001',
        composite: false,
        productPrices: [{ priceTypeId: 'pt-001', price: 100, profitMargin: 30 }],
      };

      service.create(createData).subscribe();

      expect(service.loading()).toBe(false);
    });

    it('should set error on create failure', () => {
      mockApiService.create.mockReturnValue(throwError(() => new Error('Conflict')));

      const createData: ProductCreate = {
        name: 'New Product',
        categoryId: 'cat-001',
        composite: false,
        productPrices: [{ priceTypeId: 'pt-001', price: 100, profitMargin: 30 }],
      };

      service.create(createData).subscribe({
        error: () => {
          expect(service.error()).toBe('Conflict');
        },
      });

      expect(service.loading()).toBe(false);
    });
  });

  describe('update()', () => {
    it('should update product and refresh list item', () => {
      mockApiService.getAll.mockReturnValue(of(mockPagedResponse([mockListItem])));
      service.loadAll().subscribe();

      const updatedDetails: ProductDetails = {
        ...mockDetails,
        name: 'Updated Product',
        categoryName: 'Updated Category',
      };
      mockApiService.update.mockReturnValue(of(updatedDetails));

      const updateData: ProductUpdate = {
        name: 'Updated Product',
        categoryId: 'cat-001',
        productPrices: [{ priceTypeId: 'pt-001', price: 100, profitMargin: 30 }],
      };

      service.update('prod-001', updateData).subscribe(() => {
        const updated = service.products().find((p) => p.id === 'prod-001');
        expect(updated?.name).toBe('Updated Product');
        expect(updated?.categoryName).toBe('Updated Category');
      });

      expect(service.loading()).toBe(false);
    });

    it('should update currentProduct if it matches', () => {
      mockApiService.getById.mockReturnValue(of(mockDetails));
      service.loadById('prod-001').subscribe();

      const updatedDetails: ProductDetails = { ...mockDetails, name: 'Updated Product' };
      mockApiService.update.mockReturnValue(of(updatedDetails));

      const updateData: ProductUpdate = {
        name: 'Updated Product',
        categoryId: 'cat-001',
        productPrices: [{ priceTypeId: 'pt-001', price: 100, profitMargin: 30 }],
      };

      service.update('prod-001', updateData).subscribe(() => {
        expect(service.currentProduct()?.name).toBe('Updated Product');
      });
    });

    it('should set error on update failure', () => {
      mockApiService.update.mockReturnValue(throwError(() => new Error('Update failed')));

      const updateData: ProductUpdate = {
        name: 'Updated Product',
        categoryId: 'cat-001',
        productPrices: [{ priceTypeId: 'pt-001', price: 100, profitMargin: 30 }],
      };

      service.update('prod-001', updateData).subscribe({
        error: () => {
          expect(service.error()).toBe('Update failed');
        },
      });

      expect(service.loading()).toBe(false);
    });
  });

  describe('toggleActive()', () => {
    it('should toggle product active status and update list', () => {
      mockApiService.getAll.mockReturnValue(of(mockPagedResponse([mockListItem])));
      service.loadAll().subscribe();

      const toggledDetails: ProductDetails = { ...mockDetails, active: false };
      mockApiService.toggleActive.mockReturnValue(of(toggledDetails));

      service.toggleActive('prod-001', false).subscribe(() => {
        const updated = service.products().find((p) => p.id === 'prod-001');
        expect(updated?.active).toBe(false);
      });

      expect(service.loading()).toBe(false);
    });

    it('should update currentProduct if it matches', () => {
      mockApiService.getById.mockReturnValue(of(mockDetails));
      service.loadById('prod-001').subscribe();

      const toggledDetails: ProductDetails = { ...mockDetails, active: false };
      mockApiService.toggleActive.mockReturnValue(of(toggledDetails));

      service.toggleActive('prod-001', false).subscribe(() => {
        expect(service.currentProduct()?.active).toBe(false);
      });
    });

    it('should set error on toggle failure', () => {
      mockApiService.toggleActive.mockReturnValue(throwError(() => new Error('Toggle failed')));

      service.toggleActive('prod-001', false).subscribe({
        error: () => {
          expect(service.error()).toBe('Toggle failed');
        },
      });

      expect(service.loading()).toBe(false);
    });
  });

  describe('delete()', () => {
    it('should delete product and remove from list', () => {
      mockApiService.getAll.mockReturnValue(of(mockPagedResponse([mockListItem])));
      service.loadAll().subscribe();

      mockApiService.delete.mockReturnValue(of(undefined));

      service.delete('prod-001').subscribe(() => {
        expect(service.products()).toHaveLength(0);
      });

      expect(service.loading()).toBe(false);
    });

    it('should set error on delete failure', () => {
      mockApiService.delete.mockReturnValue(throwError(() => new Error('Delete failed')));

      service.delete('prod-001').subscribe({
        error: () => {
          expect(service.error()).toBe('Delete failed');
        },
      });

      expect(service.loading()).toBe(false);
    });
  });

  describe('getById()', () => {
    it('should delegate to API getById', () => {
      mockApiService.getById.mockReturnValue(of(mockDetails));

      service.getById('prod-001').subscribe((result) => {
        expect(result).toEqual(mockDetails);
      });

      expect(mockApiService.getById).toHaveBeenCalledWith('prod-001');
    });
  });

  describe('getStock()', () => {
    it('should delegate to API getStock', () => {
      mockApiService.getStock.mockReturnValue(of(mockStock));

      service.getStock('prod-001').subscribe((result) => {
        expect(result).toEqual(mockStock);
      });

      expect(mockApiService.getStock).toHaveBeenCalledWith('prod-001');
    });
  });
});
