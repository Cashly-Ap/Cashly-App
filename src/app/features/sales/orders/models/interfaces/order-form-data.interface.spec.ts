import { describe, it, expect } from 'vitest';
import type {
  OrderFormData,
  OrderItemFormData,
} from '@features/sales/orders/models/interfaces/order-form-data.interface';

describe('OrderItemFormData interface', () => {
  it('should have all required properties', () => {
    const item: OrderItemFormData = {
      productId: 'p1',
      productCode: 'MOT-10',
      productName: 'Motor 10HP',
      quantity: 5,
      unitPrice: 100,
      stock: [],
      warehouseAllocations: [],
    };

    expect(item.productId).toBe('p1');
    expect(item.productCode).toBe('MOT-10');
    expect(item.productName).toBe('Motor 10HP');
    expect(item.quantity).toBe(5);
    expect(item.unitPrice).toBe(100);
    expect(item.stock).toEqual([]);
    expect(item.warehouseAllocations).toEqual([]);
  });

  it('should support stock items', () => {
    const item: OrderItemFormData = {
      productId: 'p1',
      productCode: 'MOT-10',
      productName: 'Motor 10HP',
      quantity: 5,
      unitPrice: 100,
      stock: [
        {
          warehouseId: 'wh-001',
          warehouseCode: 'WH1',
          warehouseName: 'Central',
          quantity: 50,
          reserved: 10,
          available: 40,
        },
      ],
      warehouseAllocations: [],
    };

    expect(item.stock).toHaveLength(1);
    expect(item.stock[0].available).toBe(40);
  });

  it('should support warehouse allocations', () => {
    const item: OrderItemFormData = {
      productId: 'p1',
      productCode: 'MOT-10',
      productName: 'Motor 10HP',
      quantity: 5,
      unitPrice: 100,
      stock: [],
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

describe('OrderFormData interface', () => {
  it('should have all required properties', () => {
    const formData: OrderFormData = {
      customerId: 'c1',
      customerAlias: 'Test Customer',
      customerLegalName: 'J-12345678-9',
      notes: '',
      items: [],
    };

    expect(formData.customerId).toBe('c1');
    expect(formData.customerAlias).toBe('Test Customer');
    expect(formData.customerLegalName).toBe('J-12345678-9');
    expect(formData.notes).toBe('');
    expect(formData.items).toEqual([]);
  });

  it('should support items with full data', () => {
    const formData: OrderFormData = {
      customerId: 'c1',
      customerAlias: 'Test',
      customerLegalName: 'J-123',
      notes: 'Order notes',
      items: [
        {
          productId: 'p1',
          productCode: 'PRD-A',
          productName: 'Product A',
          quantity: 10,
          unitPrice: 50,
          stock: [],
          warehouseAllocations: [
            {
              warehouseId: 'wh-001',
              warehouseCode: 'WH1',
              warehouseName: 'Central',
              available: 100,
              allocated: 10,
            },
          ],
        },
      ],
    };

    expect(formData.notes).toBe('Order notes');
    expect(formData.items).toHaveLength(1);
    expect(formData.items[0].productName).toBe('Product A');
  });
});
