import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { WarehouseApplicationService } from './warehouse-application.service';
import { WarehouseApiService, WarehouseFilters } from '../api/warehouse-api.service';
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
} from '../../models/interfaces';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

describe('WarehouseApplicationService', () => {
  let service: WarehouseApplicationService;
  let mockApiService: {
    getAll: ReturnType<typeof vi.fn>;
    getAllSimple: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    toggleActive: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    addEntry: ReturnType<typeof vi.fn>;
    addExit: ReturnType<typeof vi.fn>;
    getStock: ReturnType<typeof vi.fn>;
    getMovements: ReturnType<typeof vi.fn>;
  };

  const mockListItem: WarehouseList = {
    id: 'wh-001',
    name: 'Almacén Central',
    state: 'Distrito Capital',
    municipality: 'Libertador',
    active: true,
  };

  const mockDetails: WarehouseDetails = {
    id: 'wh-001',
    name: 'Almacén Central',
    state: 'Distrito Capital',
    municipality: 'Libertador',
    address: 'Av. Principal',
    description: 'Test',
    active: true,
    stock: [],
    recentMovements: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  const mockPagedResponse = <T>(items: T[]): PagedResponse<T> => ({
    content: items,
    totalElements: items.length,
    totalPages: 1,
    size: 10,
    number: 0,
  });

  beforeEach(() => {
    mockApiService = {
      getAll: vi.fn(),
      getAllSimple: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      toggleActive: vi.fn(),
      delete: vi.fn(),
      addEntry: vi.fn(),
      addExit: vi.fn(),
      getStock: vi.fn(),
      getMovements: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        WarehouseApplicationService,
        { provide: WarehouseApiService, useValue: mockApiService },
      ],
    });

    service = TestBed.inject(WarehouseApplicationService);
  });

  describe('initial state', () => {
    it('should have empty warehouses array initially', () => {
      expect(service.warehouses()).toEqual([]);
    });

    it('should have empty simpleWarehouses array initially', () => {
      expect(service.simpleWarehouses()).toEqual([]);
    });

    it('should have null currentWarehouse initially', () => {
      expect(service.currentWarehouse()).toBeNull();
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
    it('should load warehouses and update signals', () => {
      mockApiService.getAll.mockReturnValue(of(mockPagedResponse([mockListItem])));

      service.loadAll().subscribe(() => {
        expect(service.warehouses()).toHaveLength(1);
        expect(service.warehouses()[0].id).toBe('wh-001');
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
  });

  describe('loadSimpleWarehouses()', () => {
    it('should load simple warehouses and update signal', () => {
      mockApiService.getAllSimple.mockReturnValue(of([mockListItem]));

      service.loadSimpleWarehouses().subscribe(() => {
        expect(service.simpleWarehouses()).toHaveLength(1);
      });
    });
  });

  describe('loadById()', () => {
    it('should load warehouse by id and update currentWarehouse signal', () => {
      mockApiService.getById.mockReturnValue(of(mockDetails));

      service.loadById('wh-001').subscribe((warehouse) => {
        expect(warehouse.id).toBe('wh-001');
        expect(service.currentWarehouse()?.id).toBe('wh-001');
      });

      expect(service.loading()).toBe(false);
    });

    it('should set error when warehouse not found', () => {
      mockApiService.getById.mockReturnValue(throwError(() => new Error('Not found')));

      service.loadById('wh-999').subscribe({
        error: () => {
          expect(service.error()).toBe('Not found');
        },
      });

      expect(service.loading()).toBe(false);
    });
  });

  describe('create()', () => {
    it('should create warehouse', () => {
      mockApiService.create.mockReturnValue(of(mockDetails));

      const createData: WarehouseCreate = {
        name: 'Nuevo Almacén',
        state: 'Carabobo',
        municipality: 'Valencia',
      };

      service.create(createData).subscribe(() => {
        expect(service.loading()).toBe(false);
      });
    });

    it('should set error on create failure', () => {
      mockApiService.create.mockReturnValue(throwError(() => new Error('Conflict')));

      const createData: WarehouseCreate = {
        name: 'Nuevo Almacén',
        state: 'Carabobo',
        municipality: 'Valencia',
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
    it('should update warehouse and refresh list item', () => {
      mockApiService.getAll.mockReturnValue(of(mockPagedResponse([mockListItem])));
      service.loadAll().subscribe();

      const updatedDetails: WarehouseDetails = { ...mockDetails, name: 'Almacén Actualizado' };
      mockApiService.update.mockReturnValue(of(updatedDetails));

      const updateData: WarehouseUpdate = {
        name: 'Almacén Actualizado',
        state: 'Distrito Capital',
        municipality: 'Libertador',
      };

      service.update('wh-001', updateData).subscribe(() => {
        const updated = service.warehouses().find((w) => w.id === 'wh-001');
        expect(updated?.name).toBe('Almacén Actualizado');
      });

      expect(service.loading()).toBe(false);
    });

    it('should update currentWarehouse if it matches', () => {
      mockApiService.getById.mockReturnValue(of(mockDetails));
      service.loadById('wh-001').subscribe();

      const updatedDetails: WarehouseDetails = { ...mockDetails, name: 'Updated Name' };
      mockApiService.update.mockReturnValue(of(updatedDetails));

      const updateData: WarehouseUpdate = {
        name: 'Updated Name',
        state: 'Distrito Capital',
        municipality: 'Libertador',
      };

      service.update('wh-001', updateData).subscribe(() => {
        expect(service.currentWarehouse()?.name).toBe('Updated Name');
      });
    });
  });

  describe('toggleActive()', () => {
    it('should toggle active and update list item', () => {
      mockApiService.getAll.mockReturnValue(of(mockPagedResponse([mockListItem])));
      service.loadAll().subscribe();

      const toggled: WarehouseDetails = { ...mockDetails, active: false };
      mockApiService.toggleActive.mockReturnValue(of(toggled));

      service.toggleActive('wh-001', false).subscribe(() => {
        const updated = service.warehouses().find((w) => w.id === 'wh-001');
        expect(updated?.active).toBe(false);
      });

      expect(service.loading()).toBe(false);
    });

    it('should update currentWarehouse if it matches', () => {
      mockApiService.getById.mockReturnValue(of(mockDetails));
      service.loadById('wh-001').subscribe();

      const toggled: WarehouseDetails = { ...mockDetails, active: false };
      mockApiService.toggleActive.mockReturnValue(of(toggled));

      service.toggleActive('wh-001', false).subscribe(() => {
        expect(service.currentWarehouse()?.active).toBe(false);
      });
    });
  });

  describe('delete()', () => {
    it('should delete warehouse and remove from list', () => {
      mockApiService.getAll.mockReturnValue(of(mockPagedResponse([mockListItem])));
      service.loadAll().subscribe();

      mockApiService.delete.mockReturnValue(of(undefined));

      service.delete('wh-001').subscribe(() => {
        expect(service.warehouses()).toHaveLength(0);
      });

      expect(service.loading()).toBe(false);
    });

    it('should set error on delete failure', () => {
      mockApiService.delete.mockReturnValue(throwError(() => new Error('Delete failed')));

      service.delete('wh-001').subscribe({
        error: () => {
          expect(service.error()).toBe('Delete failed');
        },
      });

      expect(service.loading()).toBe(false);
    });
  });

  describe('addEntry()', () => {
    it('should delegate to api.addEntry', () => {
      mockApiService.addEntry.mockReturnValue(of(undefined));

      const entryData: StockEntryRequest = {
        items: [{ productId: 'p1', quantity: 10 }],
      };

      service.addEntry('wh-001', entryData).subscribe(() => {
        expect(mockApiService.addEntry).toHaveBeenCalledWith('wh-001', entryData);
      });
    });
  });

  describe('addExit()', () => {
    it('should delegate to api.addExit', () => {
      mockApiService.addExit.mockReturnValue(of(undefined));

      const exitData: StockExitRequest = {
        items: [{ productId: 'p1', quantity: 5 }],
      };

      service.addExit('wh-001', exitData).subscribe(() => {
        expect(mockApiService.addExit).toHaveBeenCalledWith('wh-001', exitData);
      });
    });
  });

  describe('getStock()', () => {
    it('should delegate to api.getStock', () => {
      const mockStock: WarehouseStockItem[] = [
        { productId: 'p1', productName: 'Motor 10HP', unit: '', quantity: 50 },
      ];
      mockApiService.getStock.mockReturnValue(of(mockStock));

      service.getStock('wh-001').subscribe((result) => {
        expect(result).toEqual(mockStock);
        expect(mockApiService.getStock).toHaveBeenCalledWith('wh-001');
      });
    });
  });

  describe('getMovements()', () => {
    it('should delegate to api.getMovements', () => {
      const mockMovements: PagedResponse<WarehouseMovementItem> = {
        content: [{ id: 'm1', warehouseId: 'wh-001', productId: 'p1', productCode: 'MOT-10', productName: 'Motor 10HP', movementType: 'ENTRY', quantity: 10, previousStock: 40, newStock: 50, createdAt: '2025-01-15T10:30:00Z' }],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
      };
      mockApiService.getMovements.mockReturnValue(of(mockMovements));

      const filters: MovementFilters = { page: 0, size: 15 };

      service.getMovements('wh-001', filters).subscribe((result) => {
        expect(result.content).toHaveLength(1);
        expect(mockApiService.getMovements).toHaveBeenCalledWith('wh-001', filters);
      });
    });
  });
});
