import { describe, it, expect } from 'vitest';
import type { PriceTypeDetails } from '@features/price-types/models/interfaces/price-type-details.interface';

describe('PriceTypeDetails interface', () => {
  it('should have all required properties', () => {
    const priceType: PriceTypeDetails = {
      id: 'pt-001',
      name: 'Retail',
      active: true,
    };

    expect(priceType.id).toBe('pt-001');
    expect(priceType.name).toBe('Retail');
    expect(priceType.active).toBe(true);
  });
});
