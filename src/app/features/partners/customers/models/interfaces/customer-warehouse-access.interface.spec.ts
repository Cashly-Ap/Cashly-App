import { describe, it, expect } from 'vitest';
import type { CustomerWarehouseAccessItem } from '@features/partners/customers/models/interfaces/customer-warehouse-access.interface';

describe('CustomerWarehouseAccessItem interface', () => {
  it('should have all required properties', () => {
    const item: CustomerWarehouseAccessItem = {
      id: 'cwa-001',
      customerId: 'cust-001',
      warehouseId: 'wh-001',
      warehouseName: 'Main Warehouse',
    };

    expect(item.id).toBe('cwa-001');
    expect(item.customerId).toBe('cust-001');
    expect(item.warehouseId).toBe('wh-001');
    expect(item.warehouseName).toBe('Main Warehouse');
  });
});
