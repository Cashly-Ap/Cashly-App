import { describe, it, expect } from 'vitest';
import type { ProductPriceFormItem } from './product-price-form-item.interface';

describe('ProductPriceFormItem interface', () => {
  it('should have all required properties', () => {
    const item: ProductPriceFormItem = {
      priceTypeId: 'pt-001',
      price: 100.5,
      profitMargin: 30,
    };

    expect(item.priceTypeId).toBe('pt-001');
    expect(item.price).toBe(100.5);
  });
});
