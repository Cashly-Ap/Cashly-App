import { describe, it, expect } from 'vitest';
import { QuoteProduct } from '@features/sales/quotes/models/interfaces/quote-product.interface';

describe('QuoteProduct interface', () => {
  it('should have all required properties', () => {
    const obj: QuoteProduct = {
      id: 'p1',
      code: 'MOT-10',
      name: 'Motor 10HP',
      categoryId: 'cat-001',
      categoryName: 'Motors',
      composite: false,
      active: true,
      photo: null,
      customerPrice: 100,
    };

    expect(obj.id).toBe('p1');
    expect(obj.code).toBe('MOT-10');
    expect(obj.name).toBe('Motor 10HP');
    expect(obj.categoryId).toBe('cat-001');
    expect(obj.categoryName).toBe('Motors');
    expect(obj.composite).toBe(false);
    expect(obj.active).toBe(true);
    expect(obj.photo).toBeNull();
    expect(obj.customerPrice).toBe(100);
  });

  it('should accept non-null photo', () => {
    const obj: QuoteProduct = {
      id: 'p2',
      code: 'MOT-20',
      name: 'Motor 20HP',
      categoryId: 'cat-001',
      categoryName: 'Motors',
      composite: true,
      active: true,
      photo: 'https://example.com/photo.jpg',
      customerPrice: 200,
    };

    expect(obj.photo).toBe('https://example.com/photo.jpg');
    expect(obj.composite).toBe(true);
  });

  it('should accept inactive product', () => {
    const obj: QuoteProduct = {
      id: 'p3',
      code: 'MOT-30',
      name: 'Motor 30HP',
      categoryId: 'cat-002',
      categoryName: 'Heavy Motors',
      composite: false,
      active: false,
      photo: null,
      customerPrice: 300,
    };

    expect(obj.active).toBe(false);
  });
});
