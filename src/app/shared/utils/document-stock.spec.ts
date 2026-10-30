import { describe, expect, it } from 'vitest';
import { reviewDocumentStock } from './document-stock';

describe('document stock review', () => {
  const line = {
    productId: 'p1',
    productName: 'Product',
    quantity: 4,
    allocations: [{ warehouseId: 'w1', warehouseName: 'Main', quantity: 4, available: 6 }],
  };

  it('rejects cumulative demand exceeding the same warehouse stock', () => {
    expect(reviewDocumentStock([line, line]).valid).toBe(false);
  });

  it('rejects incomplete allocations', () => {
    expect(reviewDocumentStock([{ ...line, quantity: 5 }]).valid).toBe(false);
  });

  it('rejects products without allocations', () => {
    expect(reviewDocumentStock([{ ...line, allocations: [] }]).valid).toBe(false);
  });

  it('allows exactly enough stock', () => {
    expect(
      reviewDocumentStock([
        { ...line, quantity: 6, allocations: [{ ...line.allocations[0], quantity: 6 }] },
      ]).valid,
    ).toBe(true);
  });

  it('includes this orders own reservations when consuming stock', () => {
    expect(reviewDocumentStock([line], true).rows[0].available).toBe(10);
  });

  it('rejects an empty document', () => {
    expect(reviewDocumentStock([]).valid).toBe(false);
  });
});
