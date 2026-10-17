import { describe, it, expect } from 'vitest';
import type { WarehouseAllocation } from '@features/sales/orders/models/interfaces/order-item-allocation.interface';

describe('WarehouseAllocation interface', () => {
  it('should have all required properties', () => {
    const allocation: WarehouseAllocation = {
      warehouseId: 'wh-001',
      warehouseCode: 'WH1',
      warehouseName: 'Central',
      available: 50,
      allocated: 5,
    };

    expect(allocation.warehouseId).toBe('wh-001');
    expect(allocation.warehouseCode).toBe('WH1');
    expect(allocation.warehouseName).toBe('Central');
    expect(allocation.available).toBe(50);
    expect(allocation.allocated).toBe(5);
  });

  it('should support zero allocated', () => {
    const allocation: WarehouseAllocation = {
      warehouseId: 'wh-002',
      warehouseCode: 'WH2',
      warehouseName: 'Secondary',
      available: 100,
      allocated: 0,
    };

    expect(allocation.allocated).toBe(0);
    expect(allocation.available).toBe(100);
  });
});
