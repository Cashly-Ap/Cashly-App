import { describe, it, expect } from 'vitest';
import type {
  ProductComponentItem,
  ProductDetails,
} from '@features/catalog/products/models/interfaces/product-details.interface';
import type { ProductPriceItem } from '@features/catalog/products/models/interfaces/product-price-item.interface';

describe('ProductComponentItem interface', () => {
  it('should have all required properties', () => {
    const component: ProductComponentItem = {
      id: 'comp-001',
      componentProductId: 'prod-002',
      componentProductCode: 'PRD-002',
      componentProductName: 'Sub Component',
      quantity: 2,
    };

    expect(component.id).toBe('comp-001');
    expect(component.componentProductId).toBe('prod-002');
    expect(component.componentProductCode).toBe('PRD-002');
    expect(component.componentProductName).toBe('Sub Component');
    expect(component.quantity).toBe(2);
  });
});

describe('ProductDetails interface', () => {
  it('should have all required properties', () => {
    const product: ProductDetails = {
      id: 'prod-001',
      code: 'PRD-001',
      name: 'Test Product',
      categoryId: 'cat-001',
      categoryName: 'Motors',
      composite: false,
      photo: null,
      active: true,
      components: [],
      productPrices: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
    };

    expect(product.id).toBe('prod-001');
    expect(product.code).toBe('PRD-001');
    expect(product.name).toBe('Test Product');
    expect(product.categoryId).toBe('cat-001');
    expect(product.categoryName).toBe('Motors');
    expect(product.composite).toBe(false);
    expect(product.photo).toBeNull();
    expect(product.active).toBe(true);
    expect(product.components).toEqual([]);
    expect(product.productPrices).toEqual([]);
    expect(product.createdAt).toBe('2025-01-01T00:00:00Z');
    expect(product.updatedAt).toBe('2025-01-02T00:00:00Z');
  });

  it('should allow optional fields', () => {
    const product: ProductDetails = {
      id: 'prod-001',
      code: 'PRD-001',
      name: 'Test Product',
      categoryId: 'cat-001',
      categoryName: 'Motors',
      composite: false,
      photo: 'https://example.com/photo.jpg',
      purchasePrice: 100,
      description: 'A test product',
      active: true,
      stockTotal: 50,
      components: [],
      productPrices: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
    };

    expect(product.photo).toBe('https://example.com/photo.jpg');
    expect(product.purchasePrice).toBe(100);
    expect(product.description).toBe('A test product');
    expect(product.stockTotal).toBe(50);
  });
});
