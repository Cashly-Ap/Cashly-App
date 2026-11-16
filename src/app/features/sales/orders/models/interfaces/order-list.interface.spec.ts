import { describe, it, expect } from 'vitest';
import type { OrderList } from '@features/sales/orders/models/interfaces/order-list.interface';
import { OrderStatus } from '@features/sales/orders/models/enums/order-status.enum';

describe('OrderList interface', () => {
  it('should have all required properties', () => {
    const order: OrderList = {
      id: 'ord-001',
      orderNumber: 'ORD-001',
      customerAlias: 'Test Customer',
      customerId: 'c1',
      status: OrderStatus.DRAFT,
      totalAmount: 500,
      createdAt: '2025-01-01T00:00:00Z',
    };

    expect(order.id).toBe('ord-001');
    expect(order.orderNumber).toBe('ORD-001');
    expect(order.customerAlias).toBe('Test Customer');
    expect(order.customerId).toBe('c1');
    expect(order.status).toBe(OrderStatus.DRAFT);
    expect(order.totalAmount).toBe(500);
    expect(order.createdAt).toBe('2025-01-01T00:00:00Z');
  });

  it('should accept all OrderStatus values', () => {
    const statuses: OrderStatus[] = [
      OrderStatus.DRAFT,
      OrderStatus.CONFIRMED,
      OrderStatus.CANCELLED,
      OrderStatus.INVOICED,
    ];

    statuses.forEach((status) => {
      const order: OrderList = {
        id: 'ord-001',
        orderNumber: 'ORD-001',
        customerAlias: 'Test',
        customerId: 'c1',
        status,
        totalAmount: 0,
        createdAt: '2025-01-01T00:00:00Z',
      };
      expect(order.status).toBe(status);
    });
  });
});
