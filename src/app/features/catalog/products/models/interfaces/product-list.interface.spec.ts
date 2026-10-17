import { describe, it, expect } from 'vitest';
import type {
  ProductPriceListItem,
  ProductList,
} from '@features/catalog/products/models/interfaces/product-list.interface';

describe('ProductPriceListItem interface', () => {
  it('should have all required properties', () => {
    const item: ProductPriceListItem = {
      priceTypeId: 'pt-001',
      price: 100.5,
    };

    expect(item.priceTypeId).toBe('pt-001');
    expect(item.price).toBe(100.5);
  });
});

describe('ProductList interface', () => {
  it('should have all required properties', () => {
    const product: ProductList = {
      id: 'prod-001',
      code: 'PRD-001',
      name: 'Test Product',
      categoryId: 'cat-001',
      categoryName: 'Motors',
      composite: false,
      active: true,
      productPrices: [],
    };

    expect(product.id).toBe('prod-001');
    expect(product.code).toBe('PRD-001');
    expect(product.name).toBe('Test Product');
    expect(product.categoryId).toBe('cat-001');
    expect(product.categoryName).toBe('Motors');
    expect(product.composite).toBe(false);
    expect(product.active).toBe(true);
    expect(product.productPrices).toEqual([]);
  });

  it('should allow optional fields', () => {
    const product: ProductList = {
      id: 'prod-001',
      code: 'PRD-001',
      name: 'Test Product',
      categoryId: 'cat-001',
      categoryName: 'Motors',
      composite: false,
      active: true,
      purchasePrice: 100,
      productPrices: [{ priceTypeId: 'pt-001', price: 100 }],
      stockTotal: 50,
    };

    expect(product.purchasePrice).toBe(100);
    expect(product.productPrices).toHaveLength(1);
    expect(product.stockTotal).toBe(50);
  });
});
