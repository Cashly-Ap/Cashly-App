import { describe, it, expect } from 'vitest';
import type {
  OrderProduct,
  OrderProductStockItem,
} from '@features/orders/models/interfaces/order-product.interface';

describe('OrderProductStockItem interface', () => {
  it('should have all required properties', () => {
    const stock: OrderProductStockItem = {
      warehouseId: 'wh-001',
      warehouseCode: 'WH1',
      warehouseName: 'Central',
      quantity: 50,
      reserved: 10,
      available: 40,
    };

    expect(stock.warehouseId).toBe('wh-001');
    expect(stock.warehouseCode).toBe('WH1');
    expect(stock.warehouseName).toBe('Central');
    expect(stock.quantity).toBe(50);
    expect(stock.reserved).toBe(10);
    expect(stock.available).toBe(40);
  });
});

describe('OrderProduct interface', () => {
  it('should have all required properties', () => {
    const product: OrderProduct = {
      id: 'p1',
      code: 'MOT-10',
      name: 'Motor 10HP',
      categoryId: 'cat-001',
      categoryName: 'Motors',
      composite: false,
      active: true,
      photo: null,
      customerPrice: 100,
      totalStock: 50,
      stock: [],
    };

    expect(product.id).toBe('p1');
    expect(product.code).toBe('MOT-10');
    expect(product.name).toBe('Motor 10HP');
    expect(product.categoryId).toBe('cat-001');
    expect(product.categoryName).toBe('Motors');
    expect(product.composite).toBe(false);
    expect(product.active).toBe(true);
    expect(product.photo).toBeNull();
    expect(product.customerPrice).toBe(100);
    expect(product.totalStock).toBe(50);
    expect(product.stock).toEqual([]);
  });

  it('should support photo URL', () => {
    const product: OrderProduct = {
      id: 'p1',
      code: 'MOT-10',
      name: 'Motor 10HP',
      categoryId: 'cat-001',
      categoryName: 'Motors',
      composite: false,
      active: true,
      photo: 'https://example.com/photo.jpg',
      customerPrice: 100,
      totalStock: 50,
      stock: [],
    };

    expect(product.photo).toBe('https://example.com/photo.jpg');
  });

  it('should support composite products', () => {
    const product: OrderProduct = {
      id: 'p2',
      code: 'KIT-01',
      name: 'Motor Kit',
      categoryId: 'cat-002',
      categoryName: 'Kits',
      composite: true,
      active: true,
      photo: null,
      customerPrice: 500,
      totalStock: 10,
      stock: [
        {
          warehouseId: 'wh-001',
          warehouseCode: 'WH1',
          warehouseName: 'Central',
          quantity: 10,
          reserved: 2,
          available: 8,
        },
      ],
    };

    expect(product.composite).toBe(true);
    expect(product.stock).toHaveLength(1);
  });

  it('should support inactive products', () => {
    const product: OrderProduct = {
      id: 'p3',
      code: 'OLD-01',
      name: 'Old Product',
      categoryId: 'cat-001',
      categoryName: 'Motors',
      composite: false,
      active: false,
      photo: null,
      customerPrice: 0,
      totalStock: 0,
      stock: [],
    };

    expect(product.active).toBe(false);
  });
});
