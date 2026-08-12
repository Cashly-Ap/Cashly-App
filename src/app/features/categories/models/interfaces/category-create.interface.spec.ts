import { describe, it, expect } from 'vitest';
import type { CategoryCreate } from '@features/categories/models/interfaces/category-create.interface';

describe('CategoryCreate interface', () => {
  it('should have all required properties', () => {
    const category: CategoryCreate = {
      name: 'Motors',
    };

    expect(category.name).toBe('Motors');
  });

  it('should allow optional description', () => {
    const withDesc: CategoryCreate = {
      name: 'Motors',
      description: 'Outboard motors',
    };
    expect(withDesc.description).toBe('Outboard motors');

    const withoutDesc: CategoryCreate = {
      name: 'Motors',
    };
    expect(withoutDesc.description).toBeUndefined();
  });
});
