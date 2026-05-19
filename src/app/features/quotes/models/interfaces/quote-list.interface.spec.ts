import { describe, it, expect } from 'vitest';
import { QuoteList } from './quote-list.interface';
import { QuoteStatus } from '../enums/quote-status.enum';

describe('QuoteList interface', () => {
  it('should have all required properties', () => {
    const obj: QuoteList = {
      id: 'q-001',
      quoteNumber: 'QT-001',
      customerName: 'Test Customer',
      customerRif: 'J-12345678-9',
      status: QuoteStatus.DRAFT,
      subtotal: 500,
      expiryDate: '2025-12-31',
      createdAt: '2025-01-01T00:00:00Z',
    };

    expect(obj.id).toBe('q-001');
    expect(obj.quoteNumber).toBe('QT-001');
    expect(obj.customerName).toBe('Test Customer');
    expect(obj.customerRif).toBe('J-12345678-9');
    expect(obj.status).toBe(QuoteStatus.DRAFT);
    expect(obj.subtotal).toBe(500);
    expect(obj.expiryDate).toBe('2025-12-31');
    expect(obj.createdAt).toBe('2025-01-01T00:00:00Z');
  });

  it('should accept different status values', () => {
    const obj: QuoteList = {
      id: 'q-002',
      quoteNumber: 'QT-002',
      customerName: 'Customer B',
      customerRif: 'J-98765432-1',
      status: QuoteStatus.CONVERTED_TO_ORDER,
      subtotal: 1000,
      expiryDate: '2025-06-30',
      createdAt: '2025-02-01T00:00:00Z',
    };

    expect(obj.status).toBe(QuoteStatus.CONVERTED_TO_ORDER);
  });
});
