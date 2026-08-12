import { describe, it, expect } from 'vitest';
import { QuoteWarehouse } from '@features/quotes/models/interfaces/quote-warehouse.interface';

describe('QuoteWarehouse interface', () => {
  it('should have all required properties', () => {
    const obj: QuoteWarehouse = {
      id: 'wh-001',
      name: 'Central Warehouse',
      address: '123 Main St',
    };

    expect(obj.id).toBe('wh-001');
    expect(obj.name).toBe('Central Warehouse');
    expect(obj.address).toBe('123 Main St');
  });

  it('should accept different warehouse data', () => {
    const obj: QuoteWarehouse = {
      id: 'wh-002',
      name: 'Secondary Warehouse',
      address: '456 Industrial Ave',
    };

    expect(obj.id).toBe('wh-002');
    expect(obj.name).toBe('Secondary Warehouse');
    expect(obj.address).toBe('456 Industrial Ave');
  });
});
