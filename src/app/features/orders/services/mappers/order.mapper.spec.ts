import { describe, it, expect } from 'vitest';
import { OrderMapper } from './order.mapper';
import { OrderStatus } from '../../models/enums/order-status.enum';

describe('OrderMapper', () => {
  describe('toList()', () => {
    it('should convert OrderDetails to OrderList', () => {
      const details = {
        id: 'ord-001',
        orderNumber: 'ORD-001',
        customerId: 'c1',
        customerAlias: 'Test Customer',
        customerLegalName: 'J-12345678-9',
        status: OrderStatus.DRAFT,
        notes: 'Test notes',
        totalAmount: 500,
        items: [
          {
            id: 'line-001',
            productId: 'p1',
            productName: 'Motor 10HP',
            productCode: 'MOT-10',
            quantity: 5,
            unitPrice: 100,
            subtotal: 500,
            warehouseAllocations: [],
            warehouseStocks: [],
          },
          {
            id: 'line-002',
            productId: 'p2',
            productName: 'Motor 20HP',
            productCode: 'MOT-20',
            quantity: 3,
            unitPrice: 200,
            subtotal: 600,
            warehouseAllocations: [],
            warehouseStocks: [],
          },
        ],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const result = OrderMapper.toList(details);

      expect(result.id).toBe('ord-001');
      expect(result.orderNumber).toBe('ORD-001');
      expect(result.customerId).toBe('c1');
      expect(result.customerAlias).toBe('Test Customer');
      expect(result.status).toBe(OrderStatus.DRAFT);
      expect(result.totalAmount).toBe(500);
      expect(result.createdAt).toBe('2025-01-01T00:00:00Z');
    });

    it('should handle empty items array', () => {
      const details = {
        id: 'ord-002',
        orderNumber: 'ORD-002',
        customerId: 'c2',
        customerAlias: 'Customer B',
        customerLegalName: 'J-98765432-1',
        status: OrderStatus.CONFIRMED,
        notes: null,
        totalAmount: 0,
        items: [],
        createdAt: '2025-01-02T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z',
      };

      const result = OrderMapper.toList(details);

      expect(result.id).toBe('ord-002');
      expect(result.totalAmount).toBe(0);
    });
  });

  describe('toFormModel()', () => {
    it('should convert OrderDetails to OrderFormModel', () => {
      const details = {
        id: 'ord-001',
        orderNumber: 'ORD-001',
        customerId: 'c1',
        customerAlias: 'Test Customer',
        customerLegalName: 'J-12345678-9',
        status: OrderStatus.DRAFT,
        notes: 'Test notes',
        totalAmount: 500,
        items: [
          {
            id: 'line-001',
            productId: 'p1',
            productName: 'Motor 10HP',
            productCode: 'MOT-10',
            quantity: 5,
            unitPrice: 100,
            subtotal: 500,
            warehouseAllocations: [],
            warehouseStocks: [],
          },
        ],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const result = OrderMapper.toFormModel(details);

      expect(result.id).toBe('ord-001');
      expect(result.customerId).toBe('c1');
      expect(result.notes).toBe('Test notes');
      expect(result.items).toHaveLength(1);
      expect(result.items[0].productId).toBe('p1');
      expect(result.items[0].productName).toBe('Motor 10HP');
      expect(result.items[0].productCode).toBe('MOT-10');
      expect(result.items[0].quantity).toBe(5);
      expect(result.items[0].unitPrice).toBe(100);
      expect(result.items[0].subtotal).toBe(500);
    });

    it('should convert null notes to empty string', () => {
      const details = {
        id: 'ord-002',
        orderNumber: 'ORD-002',
        customerId: 'c2',
        customerAlias: 'Customer B',
        customerLegalName: 'J-98765432-1',
        status: OrderStatus.CONFIRMED,
        notes: null,
        totalAmount: 0,
        items: [],
        createdAt: '2025-01-02T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z',
      };

      const result = OrderMapper.toFormModel(details);

      expect(result.notes).toBe('');
    });

    it('should map multiple items correctly', () => {
      const details = {
        id: 'ord-003',
        orderNumber: 'ORD-003',
        customerId: 'c3',
        customerAlias: 'Customer C',
        customerLegalName: 'J-11111111-1',
        status: OrderStatus.CANCELLED,
        notes: null,
        totalAmount: 1100,
        items: [
          {
            id: 'line-001',
            productId: 'p1',
            productName: 'Product A',
            productCode: 'PRD-A',
            quantity: 5,
            unitPrice: 100,
            subtotal: 500,
            warehouseAllocations: [],
            warehouseStocks: [],
          },
          {
            id: 'line-002',
            productId: 'p2',
            productName: 'Product B',
            productCode: 'PRD-B',
            quantity: 3,
            unitPrice: 200,
            subtotal: 600,
            warehouseAllocations: [],
            warehouseStocks: [],
          },
        ],
        createdAt: '2025-01-03T00:00:00Z',
        updatedAt: '2025-01-03T00:00:00Z',
      };

      const result = OrderMapper.toFormModel(details);

      expect(result.items).toHaveLength(2);
      expect(result.items[0].productId).toBe('p1');
      expect(result.items[1].productId).toBe('p2');
      expect(result.items[1].subtotal).toBe(600);
    });
  });
});
