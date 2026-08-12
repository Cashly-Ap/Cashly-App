import { describe, it, expect } from 'vitest';
import type {
  OrderEdit,
  OrderItemEdit,
  WarehouseAllocationEdit,
} from '@features/orders/models/interfaces/order-edit.interface';

describe('WarehouseAllocationEdit interface', () => {
  it('should have all required properties', () => {
    const allocation: WarehouseAllocationEdit = {
      warehouseId: 'wh-001',
      allocated: 5,
    };

    expect(allocation.warehouseId).toBe('wh-001');
    expect(allocation.allocated).toBe(5);
  });
});

describe('OrderItemEdit interface', () => {
  it('should have all required properties', () => {
    const item: OrderItemEdit = {
      productId: 'p1',
      quantity: 5,
      unitPrice: 100,
      warehouseAllocations: [],
    };

    expect(item.productId).toBe('p1');
    expect(item.quantity).toBe(5);
    expect(item.unitPrice).toBe(100);
    expect(item.warehouseAllocations).toEqual([]);
  });

  it('should support warehouse allocations', () => {
    const item: OrderItemEdit = {
      productId: 'p1',
      quantity: 10,
      unitPrice: 50,
      warehouseAllocations: [
        { warehouseId: 'wh-001', allocated: 6 },
        { warehouseId: 'wh-002', allocated: 4 },
      ],
    };

    expect(item.warehouseAllocations).toHaveLength(2);
  });
});

describe('OrderEdit interface', () => {
  it('should have all required properties', () => {
    const order: OrderEdit = {
      notes: null,
      lines: [],
    };

    expect(order.notes).toBeNull();
    expect(order.lines).toEqual([]);
  });

  it('should support notes and lines', () => {
    const order: OrderEdit = {
      notes: 'Updated notes',
      lines: [
        {
          productId: 'p1',
          quantity: 10,
          unitPrice: 75,
          warehouseAllocations: [{ warehouseId: 'wh-001', allocated: 10 }],
        },
      ],
    };

    expect(order.notes).toBe('Updated notes');
    expect(order.lines).toHaveLength(1);
    expect(order.lines[0].unitPrice).toBe(75);
  });
});
