import { describe, it, expect } from 'vitest';
import type { InvoicesPdfFilters } from './index';

describe('InvoicesPdfFilters interface', () => {
  it('should have all optional properties', () => {
    const filters: InvoicesPdfFilters = {
      dateFrom: '2025-01-01',
      dateTo: '2025-01-31',
      customerId: 'c1',
      status: 'DRAFT',
      productId: 'prod-001',
      categoryId: 'cat-001',
      mode: 'DETAILED',
    };

    expect(filters.dateFrom).toBe('2025-01-01');
    expect(filters.dateTo).toBe('2025-01-31');
    expect(filters.customerId).toBe('c1');
    expect(filters.status).toBe('DRAFT');
    expect(filters.productId).toBe('prod-001');
    expect(filters.categoryId).toBe('cat-001');
    expect(filters.mode).toBe('DETAILED');
  });

  it('should allow empty object', () => {
    const filters: InvoicesPdfFilters = {};
    expect(filters).toEqual({});
  });

  it('should accept SIMPLE mode', () => {
    const filters: InvoicesPdfFilters = { mode: 'SIMPLE' };
    expect(filters.mode).toBe('SIMPLE');
  });

  it('should allow partial properties', () => {
    const filters: InvoicesPdfFilters = { dateFrom: '2025-01-01', status: 'PAID' };
    expect(filters.dateFrom).toBe('2025-01-01');
    expect(filters.status).toBe('PAID');
    expect(filters.customerId).toBeUndefined();
  });
});
