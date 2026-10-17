import { describe, it, expect } from 'vitest';
import type { CatalogFilters } from '@features/catalog/products/reporting/models/interfaces/catalog-filters.interface';

describe('CatalogFilters interface', () => {
  it('should have all optional properties', () => {
    const filters: CatalogFilters = {
      search: 'motor',
      categoryId: 'cat-001',
      warehouseId: 'wh-001',
      composite: true,
      withStock: true,
      lowStock: false,
      page: 0,
      size: 10,
    };

    expect(filters.search).toBe('motor');
    expect(filters.categoryId).toBe('cat-001');
    expect(filters.warehouseId).toBe('wh-001');
    expect(filters.composite).toBe(true);
    expect(filters.withStock).toBe(true);
    expect(filters.lowStock).toBe(false);
    expect(filters.page).toBe(0);
    expect(filters.size).toBe(10);
  });

  it('should allow empty object', () => {
    const filters: CatalogFilters = {};
    expect(filters).toEqual({});
  });

  it('should allow partial properties', () => {
    const filters: CatalogFilters = { search: 'test', page: 1 };
    expect(filters.search).toBe('test');
    expect(filters.page).toBe(1);
    expect(filters.categoryId).toBeUndefined();
  });
});
