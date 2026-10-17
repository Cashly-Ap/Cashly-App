import { describe, it, expect } from 'vitest';
import type { StockPdfFilters } from '@features/inventory/warehouses/reporting/models/interfaces/stock-pdf-filters.interface';

describe('StockPdfFilters interface', () => {
  it('should have all optional properties', () => {
    const filters: StockPdfFilters = {
      warehouseId: 'wh-001',
      categoryId: 'cat-001',
      withStock: true,
      lowStock: false,
    };

    expect(filters.warehouseId).toBe('wh-001');
    expect(filters.categoryId).toBe('cat-001');
    expect(filters.withStock).toBe(true);
    expect(filters.lowStock).toBe(false);
  });

  it('should allow empty object', () => {
    const filters: StockPdfFilters = {};
    expect(filters).toEqual({});
  });

  it('should allow partial properties', () => {
    const filters: StockPdfFilters = { lowStock: true };
    expect(filters.lowStock).toBe(true);
    expect(filters.warehouseId).toBeUndefined();
  });
});
