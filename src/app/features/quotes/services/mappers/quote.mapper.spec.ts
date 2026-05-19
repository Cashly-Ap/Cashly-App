import { describe, it, expect } from 'vitest';
import { QuoteMapper } from './quote.mapper';
import { QuoteStatus } from '../../models/enums/quote-status.enum';

describe('QuoteMapper', () => {
  describe('toList()', () => {
    it('should convert QuoteDetails to QuoteList', () => {
      const details = {
        id: 'q-001',
        quoteNumber: 'QT-001',
        customerId: 'c1',
        customerName: 'Test Customer',
        customerRif: 'J-12345678-9',
        createdBy: 'user-001',
        createdByName: 'John Doe',
        status: QuoteStatus.DRAFT,
        notes: 'Test notes',
        subtotal: 500,
        lines: [
          {
            id: 'line-001',
            productId: 'p1',
            productName: 'Motor 10HP',
            productCode: 'MOT-10',
            quantity: 5,
            unitPrice: 100,
            subtotal: 500,
            allocations: [],
            warehouseStocks: [],
          },
        ],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const result = QuoteMapper.toList(details);

      expect(result.id).toBe('q-001');
      expect(result.quoteNumber).toBe('QT-001');
      expect(result.customerName).toBe('Test Customer');
      expect(result.customerRif).toBe('J-12345678-9');
      expect(result.status).toBe(QuoteStatus.DRAFT);
      expect(result.subtotal).toBe(500);
      expect(result.expiryDate).toBe('');
      expect(result.createdAt).toBe('2025-01-01T00:00:00Z');
    });

    it('should handle empty lines array', () => {
      const details = {
        id: 'q-002',
        quoteNumber: 'QT-002',
        customerId: 'c2',
        customerName: 'Customer B',
        customerRif: 'J-98765432-1',
        createdBy: 'user-002',
        createdByName: 'Jane Doe',
        status: QuoteStatus.CONVERTED_TO_ORDER,
        notes: null,
        subtotal: 0,
        lines: [],
        createdAt: '2025-02-01T00:00:00Z',
        updatedAt: '2025-02-01T00:00:00Z',
      };

      const result = QuoteMapper.toList(details);

      expect(result.id).toBe('q-002');
      expect(result.subtotal).toBe(0);
      expect(result.expiryDate).toBe('');
    });
  });

  describe('toFormModel()', () => {
    it('should convert QuoteDetails to QuoteFormModel', () => {
      const details = {
        id: 'q-001',
        quoteNumber: 'QT-001',
        customerId: 'c1',
        customerName: 'Test Customer',
        customerRif: 'J-12345678-9',
        createdBy: 'user-001',
        createdByName: 'John Doe',
        status: QuoteStatus.DRAFT,
        notes: 'Test notes',
        subtotal: 500,
        lines: [
          {
            id: 'line-001',
            productId: 'p1',
            productName: 'Motor 10HP',
            productCode: 'MOT-10',
            quantity: 5,
            unitPrice: 100,
            subtotal: 500,
            allocations: [],
            warehouseStocks: [],
          },
        ],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const result = QuoteMapper.toFormModel(details);

      expect(result.id).toBe('q-001');
      expect(result.customerId).toBe('c1');
      expect(result.notes).toBe('Test notes');
      expect(result.items).toHaveLength(1);
      expect(result.items[0].productId).toBe('p1');
      expect(result.items[0].productName).toBe('Motor 10HP');
      expect(result.items[0].productCode).toBe('MOT-10');
      expect(result.items[0].quantity).toBe(5);
      expect(result.items[0].unitPrice).toBe(100);
      expect(result.items[0].subtotal).toBe(500);
    });

    it('should convert null notes to empty string', () => {
      const details = {
        id: 'q-002',
        quoteNumber: 'QT-002',
        customerId: 'c2',
        customerName: 'Customer B',
        customerRif: 'J-98765432-1',
        createdBy: 'user-002',
        createdByName: 'Jane Doe',
        status: QuoteStatus.CONVERTED_TO_INVOICE,
        notes: null,
        subtotal: 0,
        lines: [],
        createdAt: '2025-02-01T00:00:00Z',
        updatedAt: '2025-02-01T00:00:00Z',
      };

      const result = QuoteMapper.toFormModel(details);

      expect(result.notes).toBe('');
    });

    it('should map multiple lines correctly', () => {
      const details = {
        id: 'q-003',
        quoteNumber: 'QT-003',
        customerId: 'c3',
        customerName: 'Customer C',
        customerRif: 'J-11111111-1',
        createdBy: 'user-003',
        createdByName: 'Bob Smith',
        status: QuoteStatus.CANCELLED,
        notes: null,
        subtotal: 1100,
        lines: [
          {
            id: 'line-001',
            productId: 'p1',
            productName: 'Product A',
            productCode: 'PRD-A',
            quantity: 5,
            unitPrice: 100,
            subtotal: 500,
            allocations: [],
            warehouseStocks: [],
          },
          {
            id: 'line-002',
            productId: 'p2',
            productName: 'Product B',
            productCode: 'PRD-B',
            quantity: 3,
            unitPrice: 200,
            subtotal: 600,
            allocations: [],
            warehouseStocks: [],
          },
        ],
        createdAt: '2025-03-01T00:00:00Z',
        updatedAt: '2025-03-01T00:00:00Z',
      };

      const result = QuoteMapper.toFormModel(details);

      expect(result.items).toHaveLength(2);
      expect(result.items[0].productId).toBe('p1');
      expect(result.items[1].productId).toBe('p2');
      expect(result.items[1].subtotal).toBe(600);
    });
  });
});
