import { describe, it, expect } from 'vitest';
import type { OrdersPdfFilters, OrderPdfFilters } from './index';

describe('OrdersPdfFilters interface', () => {
  it('should have all optional properties', () => {
    const filters: OrdersPdfFilters = {
      customerId: 'c1',
      status: 'DRAFT',
      fromDate: '2025-01-01',
      toDate: '2025-01-31',
      createdBy: 'user-001',
      mode: 'detailed',
    };

    expect(filters.customerId).toBe('c1');
    expect(filters.status).toBe('DRAFT');
    expect(filters.fromDate).toBe('2025-01-01');
    expect(filters.toDate).toBe('2025-01-31');
    expect(filters.createdBy).toBe('user-001');
    expect(filters.mode).toBe('detailed');
  });

  it('should allow empty object', () => {
    const filters: OrdersPdfFilters = {};
    expect(filters).toEqual({});
  });

  it('should accept simple mode', () => {
    const filters: OrdersPdfFilters = { mode: 'simple' };
    expect(filters.mode).toBe('simple');
  });
});

describe('OrderPdfFilters interface', () => {
  it('should have optional mode property', () => {
    const filters: OrderPdfFilters = { mode: 'detailed' };
    expect(filters.mode).toBe('detailed');
  });

  it('should allow empty object', () => {
    const filters: OrderPdfFilters = {};
    expect(filters).toEqual({});
  });

  it('should accept simple mode', () => {
    const filters: OrderPdfFilters = { mode: 'simple' };
    expect(filters.mode).toBe('simple');
  });
});
