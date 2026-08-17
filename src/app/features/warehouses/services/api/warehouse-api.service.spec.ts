import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  WarehouseApiService,
  WarehouseFilters,
} from '@features/warehouses/services/api/warehouse-api.service';
import {
  WarehouseList,
  WarehouseDetails,
  WarehouseCreate,
  WarehouseUpdate,
  StockEntryRequest,
  StockExitRequest,
  WarehouseStockItem,
  WarehouseMovementItem,
  MovementFilters,
} from '@features/warehouses/models/interfaces';

describe('WarehouseApiService', () => {
  let service: WarehouseApiService;
  let httpMock: HttpTestingController;

  const mockList: WarehouseList[] = [
    {
      id: 'wh-001',
      name: 'Almacén Central',
      state: 'Distrito Capital',
      municipality: 'Libertador',
      active: true,
    },
  ];

  const mockDetails: WarehouseDetails = {
    id: 'wh-001',
    name: 'Almacén Central',
    state: 'Distrito Capital',
    municipality: 'Libertador',
    address: 'Av. Principal #123',
    description: 'Almacén principal',
    active: true,
    stock: [{ productId: 'p1', productName: 'Motor 10HP', composite: false, quantity: 50 }],
    recentMovements: [
      {
        id: 'm1',
        warehouseId: 'wh-001',
        productId: 'p1',
        productCode: 'MOT-10',
        productName: 'Motor 10HP',
        movementType: 'ENTRY',
        quantity: 10,
        previousStock: 40,
        newStock: 50,
        createdAt: '2025-01-15T10:30:00Z',
      },
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T10:30:00Z',
  };

  const mockPagedResponse = <T>(content: T[], totalElements = content.length, totalPages = 1) => ({
    content,
    totalElements,
    totalPages,
    size: 10,
    number: 0,
  });

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [WarehouseApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(WarehouseApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAll()', () => {
    it('should GET /api/warehouses without filters', () => {
      service.getAll().subscribe((result) => {
        expect(result.content).toEqual(mockList);
      });

      const req = httpMock.expectOne('/api/warehouses');
      expect(req.request.method).toBe('GET');
      req.flush(mockPagedResponse(mockList));
    });

    it('should GET /api/warehouses with filters', () => {
      const filters: WarehouseFilters = {
        search: 'Central',
        active: true,
        page: 0,
        size: 10,
        orderBy: 'name',
        orderDir: 'asc',
      };

      service.getAll(filters).subscribe((result) => {
        expect(result.content).toEqual(mockList);
      });

      const req = httpMock.expectOne((r) => r.url === '/api/warehouses' && r.method === 'GET');
      expect(req.request.params.get('search')).toBe('Central');
      expect(req.request.params.get('active')).toBe('true');
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('10');
      expect(req.request.params.get('orderBy')).toBe('name');
      expect(req.request.params.get('orderDir')).toBe('asc');
      req.flush(mockPagedResponse(mockList));
    });

    it('should include state filter', () => {
      const filters: WarehouseFilters = { state: 'Zulia' };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/warehouses' && r.method === 'GET');
      expect(req.request.params.get('state')).toBe('Zulia');
      req.flush(mockPagedResponse([]));
    });
  });

  describe('getAllSimple()', () => {
    it('should GET all active warehouses with size 1000', () => {
      service.getAllSimple().subscribe((result) => {
        expect(result).toEqual(mockList);
      });

      const req = httpMock.expectOne((r) => r.url === '/api/warehouses');
      expect(req.request.params.get('size')).toBe('1000');
      expect(req.request.params.get('active')).toBe('true');
      req.flush(mockPagedResponse(mockList));
    });

    it('should return empty array when content is null', () => {
      service.getAllSimple().subscribe((result) => {
        expect(result).toEqual([]);
      });

      const req = httpMock.expectOne((r) => r.url === '/api/warehouses' && r.method === 'GET');
      req.flush({ content: null, totalElements: 0, totalPages: 0, size: 1000, number: 0 });
    });
  });

  describe('getById()', () => {
    it('should GET /api/warehouses/:id and return details', () => {
      service.getById('wh-001').subscribe((result) => {
        expect(result).toEqual(mockDetails);
      });

      const req = httpMock.expectOne('/api/warehouses/wh-001');
      expect(req.request.method).toBe('GET');
      req.flush(mockDetails);
    });

    it('should default stock and recentMovements to empty arrays when null', () => {
      const bare = {
        id: 'wh-001',
        name: 'Test',
        state: 'X',
        municipality: 'Y',
        active: true,
        createdAt: '',
        updatedAt: '',
      };

      service.getById('wh-001').subscribe((result) => {
        expect(result.stock).toEqual([]);
        expect(result.recentMovements).toEqual([]);
      });

      const req = httpMock.expectOne('/api/warehouses/wh-001');
      req.flush(bare);
    });
  });

  describe('create()', () => {
    it('should POST /api/warehouses with data and return details', () => {
      const createData: WarehouseCreate = {
        name: 'Nuevo Almacén',
        state: 'Carabobo',
        municipality: 'Valencia',
        address: 'Calle 123',
        description: 'Test',
      };

      service.create(createData).subscribe((result) => {
        expect(result).toEqual(mockDetails);
      });

      const req = httpMock.expectOne('/api/warehouses');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createData);
      req.flush(mockDetails);
    });
  });

  describe('update()', () => {
    it('should PUT /api/warehouses/:id with data and return details', () => {
      const updateData: WarehouseUpdate = {
        name: 'Almacén Actualizado',
        state: 'Carabobo',
        municipality: 'Valencia',
      };

      service.update('wh-001', updateData).subscribe((result) => {
        expect(result).toEqual(mockDetails);
      });

      const req = httpMock.expectOne('/api/warehouses/wh-001');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockDetails);
    });
  });

  describe('toggleActive()', () => {
    it('should PATCH /api/warehouses/:id/active with active flag', () => {
      service.toggleActive('wh-001', false).subscribe((result) => {
        expect(result.active).toBe(false);
      });

      const req = httpMock.expectOne('/api/warehouses/wh-001/active');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ active: false });
      req.flush({ ...mockDetails, active: false });
    });
  });

  describe('delete()', () => {
    it('should DELETE /api/warehouses/:id', () => {
      service.delete('wh-001').subscribe();

      const req = httpMock.expectOne('/api/warehouses/wh-001');
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });

  describe('addEntry()', () => {
    it('should POST /api/warehouses/:id/stock/entry', () => {
      const entryData: StockEntryRequest = {
        items: [{ productId: 'p1', quantity: 10, unitPrice: 100, notes: 'Test' }],
      };

      service.addEntry('wh-001', entryData).subscribe();

      const req = httpMock.expectOne('/api/warehouses/wh-001/stock/entry');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(entryData);
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });

  describe('addExit()', () => {
    it('should POST /api/warehouses/:id/stock/exit', () => {
      const exitData: StockExitRequest = {
        items: [{ productId: 'p1', quantity: 5, notes: 'Test' }],
      };

      service.addExit('wh-001', exitData).subscribe();

      const req = httpMock.expectOne('/api/warehouses/wh-001/stock/exit');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(exitData);
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });

  describe('getStock()', () => {
    it('should GET /api/warehouses/:id/stock with size 1000', () => {
      const mockStock: WarehouseStockItem[] = [
        { productId: 'p1', productName: 'Motor 10HP', composite: true, quantity: 50 },
      ];

      service.getStock('wh-001').subscribe((result) => {
        expect(result).toEqual(mockStock);
      });

      const req = httpMock.expectOne(
        (r) => r.url === '/api/warehouses/wh-001/stock' && r.method === 'GET',
      );
      expect(req.request.params.get('size')).toBe('1000');
      req.flush(
        mockPagedResponse([
          { productId: 'p1', productName: 'Motor 10HP', composite: true, quantity: 50 },
        ]),
      );
    });

    it('should return empty array when content is null', () => {
      service.getStock('wh-001').subscribe((result) => {
        expect(result).toEqual([]);
      });

      const req = httpMock.expectOne(
        (r) => r.url === '/api/warehouses/wh-001/stock' && r.method === 'GET',
      );
      req.flush({ content: null, totalElements: 0, totalPages: 0, size: 1000, number: 0 });
    });
  });

  describe('getMovements()', () => {
    it('should GET /api/warehouses/:id/movements without filters', () => {
      const mockMovements: WarehouseMovementItem[] = [
        {
          id: 'm1',
          warehouseId: 'wh-001',
          productId: 'p1',
          productCode: 'MOT-10',
          productName: 'Motor 10HP',
          movementType: 'ENTRY',
          quantity: 10,
          previousStock: 40,
          newStock: 50,
          createdAt: '2025-01-15T10:30:00Z',
        },
      ];

      service.getMovements('wh-001').subscribe((result) => {
        expect(result.content).toEqual(mockMovements);
      });

      const req = httpMock.expectOne('/api/warehouses/wh-001/movements');
      expect(req.request.method).toBe('GET');
      req.flush(mockPagedResponse(mockMovements));
    });

    it('should GET /api/warehouses/:id/movements with filters', () => {
      const filters: MovementFilters = {
        productId: 'p1',
        movementType: 'EXIT',
        page: 1,
        size: 20,
      };

      service.getMovements('wh-001', filters).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/warehouses/wh-001/movements' && r.method === 'GET',
      );
      expect(req.request.params.get('productId')).toBe('p1');
      expect(req.request.params.get('movementType')).toBe('EXIT');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('size')).toBe('20');
      req.flush(mockPagedResponse([]));
    });
  });
});
