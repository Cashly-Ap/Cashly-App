import { describe, it, expect } from 'vitest';
import type { ProductStockByWarehouse } from '@features/catalog/products/models/interfaces/product-stock-by-warehouse.interface';

describe('ProductStockByWarehouse interface', () => {
  it('should have all required properties', () => {
    const stock: ProductStockByWarehouse = {
      warehouseId: 'wh-001',
      warehouseName: 'Main Warehouse',
      quantity: 100,
      lastMovementAt: '2025-01-15T10:00:00Z',
    };

    expect(stock.warehouseId).toBe('wh-001');
    expect(stock.warehouseName).toBe('Main Warehouse');
    expect(stock.quantity).toBe(100);
    expect(stock.lastMovementAt).toBe('2025-01-15T10:00:00Z');
  });

  it('should allow null lastMovementAt', () => {
    const stock: ProductStockByWarehouse = {
      warehouseId: 'wh-002',
      warehouseName: 'Empty Warehouse',
      quantity: 0,
      lastMovementAt: null,
    };

    expect(stock.lastMovementAt).toBeNull();
  });
});
