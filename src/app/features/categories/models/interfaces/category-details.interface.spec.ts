import { describe, it, expect } from 'vitest';
import type { CategoryDetails } from './category-details.interface';

describe('CategoryDetails interface', () => {
  it('should have all required properties including inherited', () => {
    const category: CategoryDetails = {
      id: 'cat-001',
      name: 'Motors',
      active: true,
      productCount: 10,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
    };

    expect(category.id).toBe('cat-001');
    expect(category.name).toBe('Motors');
    expect(category.active).toBe(true);
    expect(category.productCount).toBe(10);
    expect(category.createdAt).toBe('2025-01-01T00:00:00Z');
    expect(category.updatedAt).toBe('2025-01-02T00:00:00Z');
  });

  it('should allow optional description from parent', () => {
    const category: CategoryDetails = {
      id: 'cat-001',
      name: 'Motors',
      description: 'Outboard motors',
      active: true,
      productCount: 10,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
    };
    expect(category.description).toBe('Outboard motors');
  });
});
