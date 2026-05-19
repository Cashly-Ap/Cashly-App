import { describe, it, expect } from 'vitest';
import type { PriceTypeUpdate } from './price-type-update.interface';

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
