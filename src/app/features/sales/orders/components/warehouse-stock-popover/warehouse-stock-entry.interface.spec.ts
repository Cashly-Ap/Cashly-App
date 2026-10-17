import { describe, it, expect } from 'vitest';
import type { WarehouseStockEntry } from '@features/sales/orders/components/warehouse-stock-popover/warehouse-stock-entry.interface';

describe('WarehouseStockEntry interface', () => {
  it('should have all required properties', () => {
    const entry: WarehouseStockEntry = {
      warehouseId: 'wh-001',
      warehouseCode: 'WH-MAIN',
      warehouseName: 'Main Warehouse',
      quantity: 100,
      reserved: 20,
      available: 80,
      allocated: 10,
    };

    expect(entry.warehouseId).toBe('wh-001');
    expect(entry.warehouseCode).toBe('WH-MAIN');
    expect(entry.warehouseName).toBe('Main Warehouse');
    expect(entry.quantity).toBe(100);
    expect(entry.reserved).toBe(20);
    expect(entry.available).toBe(80);
    expect(entry.allocated).toBe(10);
  });

  it('should handle zero stock values', () => {
    const entry: WarehouseStockEntry = {
      warehouseId: 'wh-002',
      warehouseCode: 'WH-EMPTY',
      warehouseName: 'Empty Warehouse',
      quantity: 0,
      reserved: 0,
      available: 0,
      allocated: 0,
    };

    expect(entry.quantity).toBe(0);
    expect(entry.reserved).toBe(0);
    expect(entry.available).toBe(0);
    expect(entry.allocated).toBe(0);
  });
});
