import { describe, it, expect } from 'vitest';
import type {
  CatalogItem,
  CatalogWarehouseStock,
} from '@features/catalog/products/reporting/models/interfaces/catalog-item.interface';

describe('CatalogWarehouseStock interface', () => {
  it('should have all required properties', () => {
    const stock: CatalogWarehouseStock = {
      warehouseId: 'wh-001',
      warehouseName: 'Central Warehouse',
      quantity: 50,
    };

    expect(stock.warehouseId).toBe('wh-001');
    expect(stock.warehouseName).toBe('Central Warehouse');
    expect(stock.quantity).toBe(50);
  });
});

describe('CatalogItem interface', () => {
  it('should have all required properties', () => {
    const item: CatalogItem = {
      productId: 'prod-001',
      productName: 'Motor 10HP',
      categoryName: 'Motors',
      composite: false,
      totalStock: 100,
      warehouseStocks: [
        { warehouseId: 'wh-001', warehouseName: 'Central', quantity: 60 },
        { warehouseId: 'wh-002', warehouseName: 'Secondary', quantity: 40 },
      ],
    };

    expect(item.productId).toBe('prod-001');
    expect(item.productName).toBe('Motor 10HP');
    expect(item.categoryName).toBe('Motors');
    expect(item.composite).toBe(false);
    expect(item.totalStock).toBe(100);
    expect(item.warehouseStocks).toHaveLength(2);
    expect(item.warehouseStocks[0].warehouseId).toBe('wh-001');
  });

  it('should accept composite product', () => {
    const item: CatalogItem = {
      productId: 'prod-002',
      productName: 'Generator Set',
      categoryName: 'Generators',
      composite: true,
      totalStock: 5,
      warehouseStocks: [],
    };

    expect(item.composite).toBe(true);
    expect(item.warehouseStocks).toHaveLength(0);
  });
});
