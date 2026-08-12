import { describe, it, expect } from 'vitest';
import type { CategoryList } from '@features/categories/models/interfaces/category-list.interface';

describe('CategoryList interface', () => {
  it('should have all required properties', () => {
    const category: CategoryList = {
      id: 'cat-001',
      name: 'Motors',
      active: true,
      productCount: 10,
      deletable: false,
    };

    expect(category.id).toBe('cat-001');
    expect(category.name).toBe('Motors');
    expect(category.active).toBe(true);
    expect(category.productCount).toBe(10);
    expect(category.deletable).toBe(false);
  });

  it('should allow optional description', () => {
    const withDesc: CategoryList = {
      id: 'cat-001',
      name: 'Motors',
      description: 'Outboard motors',
      active: true,
      productCount: 10,
      deletable: false,
    };
    expect(withDesc.description).toBe('Outboard motors');

    const withoutDesc: CategoryList = {
      id: 'cat-001',
      name: 'Motors',
      active: true,
      productCount: 10,
      deletable: false,
    };
    expect(withoutDesc.description).toBeUndefined();
  });
});
