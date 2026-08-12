import { describe, it, expect } from 'vitest';
import {
  WarehouseList,
  WarehouseStockItem,
  WarehouseMovementItem,
  MovementFilters,
  WarehouseDetails,
  WarehouseCreate,
  WarehouseUpdate,
  StockBatchItem,
  StockEntryRequest,
  StockExitRequest,
} from '@features/warehouses/models/interfaces/warehouse.interfaces';

describe('WarehouseList interface', () => {
  it('should have all required fields', () => {
    const item: WarehouseList = {
      id: 'wh-001',
      name: 'Almacén Central',
      state: 'Distrito Capital',
      municipality: 'Libertador',
      active: true,
    };
    expect(item.id).toBe('wh-001');
    expect(item.name).toBe('Almacén Central');
    expect(item.state).toBe('Distrito Capital');
    expect(item.municipality).toBe('Libertador');
    expect(item.active).toBe(true);
  });
});

describe('WarehouseStockItem interface', () => {
  it('should have all required fields', () => {
    const item: WarehouseStockItem = {
      productId: 'p1',
      productName: 'Motor 10HP',
      unit: 'unidad',
      quantity: 50,
    };
    expect(item.productId).toBe('p1');
    expect(item.quantity).toBe(50);
  });
});

describe('WarehouseMovementItem interface', () => {
  it('should have all required fields', () => {
    const item: WarehouseMovementItem = {
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
    };
    expect(item.id).toBe('m1');
    expect(item.movementType).toBe('ENTRY');
    expect(item.quantity).toBe(10);
  });

  it('should support optional notes field', () => {
    const withNotes: WarehouseMovementItem = {
      id: 'm1',
      warehouseId: 'wh-001',
      productId: 'p1',
      productCode: 'MOT-10',
      productName: 'Motor 10HP',
      movementType: 'ENTRY',
      quantity: 10,
      previousStock: 40,
      newStock: 50,
      notes: 'Test notes',
      createdAt: '2025-01-15T10:30:00Z',
    };
    expect(withNotes.notes).toBe('Test notes');
  });
});

describe('MovementFilters interface', () => {
  it('should support all optional fields', () => {
    const filters: MovementFilters = {
      productId: 'p1',
      movementType: 'ENTRY',
      page: 0,
      size: 15,
    };
    expect(filters.productId).toBe('p1');
    expect(filters.movementType).toBe('ENTRY');
    expect(filters.page).toBe(0);
    expect(filters.size).toBe(15);
  });

  it('should work with empty filters', () => {
    const filters: MovementFilters = {};
    expect(Object.keys(filters)).toHaveLength(0);
  });
});

describe('WarehouseDetails interface', () => {
  it('should have all required fields', () => {
    const details: WarehouseDetails = {
      id: 'wh-001',
      name: 'Almacén Central',
      state: 'Distrito Capital',
      municipality: 'Libertador',
      active: true,
      stock: [],
      recentMovements: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-15T10:30:00Z',
    };
    expect(details.stock).toEqual([]);
    expect(details.recentMovements).toEqual([]);
  });

  it('should support optional address and description', () => {
    const details: WarehouseDetails = {
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
      updatedAt: '2025-01-15T10:30:00Z',
    };
    expect(details.address).toBe('Av. Principal');
    expect(details.description).toBe('Test');
  });
});

describe('WarehouseCreate interface', () => {
  it('should have required fields', () => {
    const data: WarehouseCreate = {
      name: 'Nuevo Almacén',
      state: 'Carabobo',
      municipality: 'Valencia',
    };
    expect(data.name).toBe('Nuevo Almacén');
  });

  it('should support optional fields', () => {
    const data: WarehouseCreate = {
      name: 'Nuevo Almacén',
      state: 'Carabobo',
      municipality: 'Valencia',
      address: 'Calle 123',
      description: 'Test',
    };
    expect(data.address).toBe('Calle 123');
    expect(data.description).toBe('Test');
  });
});

describe('WarehouseUpdate interface', () => {
  it('should have required fields', () => {
    const data: WarehouseUpdate = {
      name: 'Almacén Actualizado',
      state: 'Carabobo',
      municipality: 'Valencia',
    };
    expect(data.name).toBe('Almacén Actualizado');
  });
});

describe('StockBatchItem interface', () => {
  it('should have required fields', () => {
    const item: StockBatchItem = {
      productId: 'p1',
      quantity: 10,
    };
    expect(item.productId).toBe('p1');
    expect(item.quantity).toBe(10);
  });

  it('should support optional fields', () => {
    const item: StockBatchItem = {
      productId: 'p1',
      quantity: 10,
      unitPrice: 100.5,
      notes: 'Test',
    };
    expect(item.unitPrice).toBe(100.5);
    expect(item.notes).toBe('Test');
  });
});

describe('StockEntryRequest interface', () => {
  it('should have items array', () => {
    const request: StockEntryRequest = {
      items: [
        { productId: 'p1', quantity: 10 },
        { productId: 'p2', quantity: 5 },
      ],
    };
    expect(request.items).toHaveLength(2);
  });
});

describe('StockExitRequest interface', () => {
  it('should have items array', () => {
    const request: StockExitRequest = {
      items: [{ productId: 'p1', quantity: 5 }],
    };
    expect(request.items).toHaveLength(1);
  });
});
