import { describe, it, expect } from 'vitest';
import type { ProductPriceItem } from '@features/products/models/interfaces/product-price-item.interface';

describe('ProductPriceItem interface', () => {
  it('should have all required properties', () => {
    const item: ProductPriceItem = {
      id: 'pp-001',
      priceTypeId: 'pt-001',
      priceTypeName: 'Retail',
      price: 100.5,
    };

    expect(item.id).toBe('pp-001');
    expect(item.priceTypeId).toBe('pt-001');
    expect(item.priceTypeName).toBe('Retail');
    expect(item.price).toBe(100.5);
  });
});
