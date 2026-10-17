import { describe, it, expect } from 'vitest';
import type { CatalogPdfFilters } from '@features/catalog/products/reporting/models/interfaces/catalog-pdf-filters.interface';

describe('CatalogPdfFilters interface', () => {
  it('should have all optional properties', () => {
    const filters: CatalogPdfFilters = {
      search: 'motor',
      categoryId: 'cat-001',
      warehouseId: 'wh-001',
      withStock: true,
    };

    expect(filters.search).toBe('motor');
    expect(filters.categoryId).toBe('cat-001');
    expect(filters.warehouseId).toBe('wh-001');
    expect(filters.withStock).toBe(true);
  });

  it('should allow empty object', () => {
    const filters: CatalogPdfFilters = {};
    expect(filters).toEqual({});
  });

  it('should allow partial properties', () => {
    const filters: CatalogPdfFilters = { warehouseId: 'wh-001' };
    expect(filters.warehouseId).toBe('wh-001');
    expect(filters.search).toBeUndefined();
  });
});
