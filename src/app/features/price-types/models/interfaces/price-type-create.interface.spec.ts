import { describe, it, expect } from 'vitest';
import type { PriceTypeCreate } from '@features/price-types/models/interfaces/price-type-create.interface';

describe('PriceTypeCreate interface', () => {
  it('should have all required properties', () => {
    const priceType: PriceTypeCreate = {
      name: 'Wholesale',
    };

    expect(priceType.name).toBe('Wholesale');
  });
});
