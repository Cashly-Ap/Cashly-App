import { describe, it, expect } from 'vitest';
import type { MovementsPdfFilters } from './movements-pdf-filters.interface';

describe('MovementsPdfFilters interface', () => {
  it('should have all optional properties', () => {
    const filters: MovementsPdfFilters = {
      warehouseId: 'wh-001',
      productId: 'prod-001',
      movementType: 'IN',
      from: '2025-01-01',
      to: '2025-01-31',
    };

    expect(filters.warehouseId).toBe('wh-001');
    expect(filters.productId).toBe('prod-001');
    expect(filters.movementType).toBe('IN');
    expect(filters.from).toBe('2025-01-01');
    expect(filters.to).toBe('2025-01-31');
  });

  it('should allow empty object', () => {
    const filters: MovementsPdfFilters = {};
    expect(filters).toEqual({});
  });

  it('should allow partial properties with date range only', () => {
    const filters: MovementsPdfFilters = { from: '2025-01-01', to: '2025-12-31' };
    expect(filters.from).toBe('2025-01-01');
    expect(filters.to).toBe('2025-12-31');
    expect(filters.warehouseId).toBeUndefined();
  });
});
