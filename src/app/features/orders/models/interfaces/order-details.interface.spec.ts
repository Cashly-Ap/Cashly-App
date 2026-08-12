import { describe, it, expect } from 'vitest';
import type {
  OrderDetails,
  OrderItemDetail,
  OrderItemAllocationDetail,
} from '@features/orders/models/interfaces/order-details.interface';
import { OrderStatus } from '@features/orders/models/enums/order-status.enum';

describe('OrderItemAllocationDetail interface', () => {
  it('should have all required properties', () => {
    const allocation: OrderItemAllocationDetail = {
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
});

describe('OrderItemDetail interface', () => {
  it('should have all required properties', () => {
    const item: OrderItemDetail = {
      id: 'line-001',
      productId: 'p1',
      productName: 'Motor 10HP',
      productCode: 'MOT-10',
      quantity: 5,
      unitPrice: 100,
      subtotal: 500,
      warehouseAllocations: [],
    };

    expect(item.id).toBe('line-001');
    expect(item.productId).toBe('p1');
    expect(item.productName).toBe('Motor 10HP');
    expect(item.productCode).toBe('MOT-10');
    expect(item.quantity).toBe(5);
    expect(item.unitPrice).toBe(100);
    expect(item.subtotal).toBe(500);
    expect(item.warehouseAllocations).toEqual([]);
  });

  it('should have optional warehouseStocks', () => {
    const item: OrderItemDetail = {
      id: 'line-001',
      productId: 'p1',
      productName: 'Motor 10HP',
      productCode: 'MOT-10',
      quantity: 5,
      unitPrice: 100,
      subtotal: 500,
      warehouseAllocations: [],
      warehouseStocks: [
        {
          warehouseId: 'wh-001',
          warehouseCode: 'WH1',
          warehouseName: 'Central',
          quantity: 50,
          reserved: 10,
          available: 40,
        },
      ],
    };

    expect(item.warehouseStocks).toHaveLength(1);
    expect(item.warehouseStocks![0].available).toBe(40);
  });

  it('should support warehouseAllocations with data', () => {
    const item: OrderItemDetail = {
      id: 'line-001',
      productId: 'p1',
      productName: 'Motor 10HP',
      productCode: 'MOT-10',
      quantity: 5,
      unitPrice: 100,
      subtotal: 500,
      warehouseAllocations: [
        {
          warehouseId: 'wh-001',
          warehouseCode: 'WH1',
          warehouseName: 'Central',
          available: 50,
          allocated: 5,
        },
      ],
    };

    expect(item.warehouseAllocations).toHaveLength(1);
    expect(item.warehouseAllocations[0].allocated).toBe(5);
  });
});

describe('OrderDetails interface', () => {
  it('should have all required properties', () => {
    const order: OrderDetails = {
      id: 'ord-001',
      orderNumber: 'ORD-001',
      customerId: 'c1',
      customerAlias: 'Test Customer',
      customerLegalName: 'J-12345678-9',
      status: OrderStatus.DRAFT,
      notes: null,
      totalAmount: 500,
      items: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };

    expect(order.id).toBe('ord-001');
    expect(order.orderNumber).toBe('ORD-001');
    expect(order.customerId).toBe('c1');
    expect(order.customerAlias).toBe('Test Customer');
    expect(order.customerLegalName).toBe('J-12345678-9');
    expect(order.status).toBe(OrderStatus.DRAFT);
    expect(order.notes).toBeNull();
    expect(order.totalAmount).toBe(500);
    expect(order.items).toEqual([]);
    expect(order.createdAt).toBe('2025-01-01T00:00:00Z');
    expect(order.updatedAt).toBe('2025-01-01T00:00:00Z');
  });

  it('should support items with allocations and stocks', () => {
    const order: OrderDetails = {
      id: 'ord-001',
      orderNumber: 'ORD-001',
      customerId: 'c1',
      customerAlias: 'Test',
      customerLegalName: 'J-123',
      status: OrderStatus.CONFIRMED,
      notes: 'Test notes',
      totalAmount: 1000,
      items: [
        {
          id: 'line-001',
          productId: 'p1',
          productName: 'Product A',
          productCode: 'PRD-A',
          quantity: 10,
          unitPrice: 100,
          subtotal: 1000,
          warehouseAllocations: [
            {
              warehouseId: 'wh-001',
              warehouseCode: 'WH1',
              warehouseName: 'Central',
              available: 100,
              allocated: 10,
            },
          ],
          warehouseStocks: [
            {
              warehouseId: 'wh-001',
              warehouseCode: 'WH1',
              warehouseName: 'Central',
              quantity: 100,
              reserved: 20,
              available: 80,
            },
          ],
        },
      ],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
    };

    expect(order.items).toHaveLength(1);
    expect(order.items[0].warehouseAllocations).toHaveLength(1);
    expect(order.items[0].warehouseStocks).toHaveLength(1);
    expect(order.notes).toBe('Test notes');
  });
});
