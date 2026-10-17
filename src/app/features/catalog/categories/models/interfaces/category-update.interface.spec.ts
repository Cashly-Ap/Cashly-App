import { describe, it, expect } from 'vitest';
import type { CategoryUpdate } from '@features/catalog/categories/models/interfaces/category-update.interface';

describe('CategoryUpdate interface', () => {
  it('should have all required properties', () => {
    const category: CategoryUpdate = {
      name: 'Updated Motors',
    };

    expect(category.name).toBe('Updated Motors');
  });

  it('should allow optional description', () => {
    const withDesc: CategoryUpdate = {
      name: 'Updated Motors',
      description: 'Updated description',
    };
    expect(withDesc.description).toBe('Updated description');

    const withoutDesc: CategoryUpdate = {
      name: 'Updated Motors',
    };
    expect(withoutDesc.description).toBeUndefined();
  });
});
