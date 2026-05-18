import { describe, it, expect } from 'vitest';
import type { OrderCreate, OrderItemCreate, WarehouseAllocationCreate } from './order-create.interface';

describe('WarehouseAllocationCreate interface', () => {
  it('should have all required properties', () => {
    const allocation: WarehouseAllocationCreate = {
      warehouseId: 'wh-001',
      allocated: 5,
    };

    expect(allocation.warehouseId).toBe('wh-001');
    expect(allocation.allocated).toBe(5);
  });
});

describe('OrderItemCreate interface', () => {
  it('should have all required properties', () => {
    const item: OrderItemCreate = {
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
    const item: OrderItemCreate = {
      productId: 'p1',
      quantity: 10,
      unitPrice: 50,
      warehouseAllocations: [
        { warehouseId: 'wh-001', allocated: 6 },
        { warehouseId: 'wh-002', allocated: 4 },
      ],
    };

    expect(item.warehouseAllocations).toHaveLength(2);
    expect(item.warehouseAllocations[0].allocated).toBe(6);
  });
});

describe('OrderCreate interface', () => {
  it('should have all required properties', () => {
    const order: OrderCreate = {
      customerId: 'c1',
      notes: null,
      lines: [],
    };

    expect(order.customerId).toBe('c1');
    expect(order.notes).toBeNull();
    expect(order.lines).toEqual([]);
  });

  it('should support notes and lines', () => {
    const order: OrderCreate = {
      customerId: 'c1',
      notes: 'Test notes',
      lines: [
        {
          productId: 'p1',
          quantity: 5,
          unitPrice: 100,
          warehouseAllocations: [{ warehouseId: 'wh-001', allocated: 5 }],
        },
      ],
    };

    expect(order.notes).toBe('Test notes');
    expect(order.lines).toHaveLength(1);
    expect(order.lines[0].productId).toBe('p1');
  });
});
