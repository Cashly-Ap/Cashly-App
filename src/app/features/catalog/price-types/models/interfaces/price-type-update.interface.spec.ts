import { describe, it, expect } from 'vitest';
import type { PriceTypeUpdate } from '@features/catalog/price-types/models/interfaces/price-type-update.interface';

describe('PriceTypeUpdate interface', () => {
  it('should have all required properties', () => {
    const priceType: PriceTypeUpdate = {
      name: 'Updated Retail',
      active: true,
    };

    expect(priceType.name).toBe('Updated Retail');
    expect(priceType.active).toBe(true);
  });
});
