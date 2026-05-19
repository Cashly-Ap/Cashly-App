import { describe, it, expect } from 'vitest';
import type { PriceTypeList } from './price-type-list.interface';

describe('PriceTypeList interface', () => {
  it('should have all required properties', () => {
    const priceType: PriceTypeList = {
      id: 'pt-001',
      name: 'Retail',
      active: true,
    };

    expect(priceType.id).toBe('pt-001');
    expect(priceType.name).toBe('Retail');
    expect(priceType.active).toBe(true);
  });
});
