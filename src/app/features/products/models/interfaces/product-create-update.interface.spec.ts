import { describe, it, expect } from 'vitest';
import type {
  ProductComponentInput,
  ProductCreate,
  ProductUpdate,
} from '@features/products/models/interfaces/product-create-update.interface';
import type { ProductPriceFormItem } from '@features/products/models/interfaces/product-price-form-item.interface';

describe('ProductComponentInput interface', () => {
  it('should have all required properties', () => {
    const component: ProductComponentInput = {
      componentProductId: 'prod-002',
      quantity: 2,
    };

    expect(component.componentProductId).toBe('prod-002');
    expect(component.quantity).toBe(2);
  });
});

describe('ProductCreate interface', () => {
  it('should have all required properties', () => {
    const product: ProductCreate = {
      name: 'New Product',
      categoryId: 'cat-001',
      composite: false,
      productPrices: [],
    };

    expect(product.name).toBe('New Product');
    expect(product.categoryId).toBe('cat-001');
    expect(product.composite).toBe(false);
    expect(product.productPrices).toEqual([]);
  });

  it('should allow optional fields', () => {
    const product: ProductCreate = {
      name: 'New Product',
      categoryId: 'cat-001',
      composite: true,
      description: 'A new composite product',
      purchasePrice: 100,
      components: [{ componentProductId: 'prod-002', quantity: 2 }],
      productPrices: [{ priceTypeId: 'pt-001', price: 100, profitMargin: 33.33 }],
    };

    expect(product.description).toBe('A new composite product');
    expect(product.purchasePrice).toBe(100);
    expect(product.components).toHaveLength(1);
    expect(product.productPrices).toHaveLength(1);
  });
});

describe('ProductUpdate interface', () => {
  it('should have all required properties', () => {
    const product: ProductUpdate = {
      name: 'Updated Product',
      categoryId: 'cat-001',
      productPrices: [],
    };

    expect(product.name).toBe('Updated Product');
    expect(product.categoryId).toBe('cat-001');
    expect(product.productPrices).toEqual([]);
  });

  it('should allow optional fields', () => {
    const product: ProductUpdate = {
      name: 'Updated Product',
      categoryId: 'cat-001',
      description: 'Updated description',
      purchasePrice: 120,
      components: [{ componentProductId: 'prod-003', quantity: 1 }],
      productPrices: [{ priceTypeId: 'pt-001', price: 150, profitMargin: 40 }],
    };

    expect(product.description).toBe('Updated description');
    expect(product.purchasePrice).toBe(120);
    expect(product.components).toHaveLength(1);
    expect(product.productPrices).toHaveLength(1);
  });
});
