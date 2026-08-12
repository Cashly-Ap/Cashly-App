import { describe, it, expect } from 'vitest';
import { InvoiceMapper } from '@features/invoices/services/mappers/invoice.mapper';
import { InvoiceStatus } from '@features/invoices/models/enums/invoice-status.enum';
import { PaymentType } from '@features/invoices/models/enums/payment-type.enum';

describe('InvoiceMapper', () => {
  describe('toList()', () => {
    it('should convert InvoiceDetails to InvoiceList', () => {
      const details = {
        id: 'inv-001',
        invoiceNumber: 'FAC-001',
        customerId: 'c1',
        customerName: 'Test Customer',
        customerRif: 'J-12345678-9',
        createdBy: 'user-001',
        createdByName: 'John Doe',
        orderId: null,
        orderNumber: null,
        status: InvoiceStatus.DRAFT,
        paymentType: PaymentType.CASH,
        notes: 'Test notes',
        subtotal: 500,
        cancelledAt: null,
        cancelledReason: null,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        lines: [
          {
            id: 'line-001',
            productId: 'p1',
            productName: 'Motor 10HP',
            productCode: 'MOT-10',
            quantity: 5,
            unitPrice: 100,
            lineTotal: 500,
            warehouseAllocations: [],
            warehouseStocks: [],
          },
          {
            id: 'line-002',
            productId: 'p2',
            productName: 'Motor 20HP',
            productCode: 'MOT-20',
            quantity: 3,
            unitPrice: 200,
            lineTotal: 600,
            warehouseAllocations: [],
            warehouseStocks: [],
          },
        ],
      };

      const result = InvoiceMapper.toList(details);

      expect(result.id).toBe('inv-001');
      expect(result.invoiceNumber).toBe('FAC-001');
      expect(result.customerId).toBe('c1');
      expect(result.customerName).toBe('Test Customer');
      expect(result.status).toBe(InvoiceStatus.DRAFT);
      expect(result.paymentType).toBe(PaymentType.CASH);
      expect(result.subtotal).toBe(500);
      expect(result.lineCount).toBe(2);
      expect(result.orderId).toBeNull();
      expect(result.orderNumber).toBeNull();
      expect(result.createdAt).toBe('2025-01-01T00:00:00Z');
    });

    it('should calculate lineCount from lines array length', () => {
      const details = {
        id: 'inv-002',
        invoiceNumber: 'FAC-002',
        customerId: 'c2',
        customerName: 'Customer B',
        customerRif: 'J-98765432-1',
        createdBy: 'user-002',
        createdByName: 'Jane Doe',
        orderId: 'ord-001',
        orderNumber: 'ORD-001',
        status: InvoiceStatus.PAID,
        paymentType: PaymentType.CREDIT,
        notes: null,
        subtotal: 1000,
        cancelledAt: null,
        cancelledReason: null,
        createdAt: '2025-01-02T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z',
        lines: [
          {
            id: 'line-003',
            productId: 'p3',
            productName: 'Product C',
            productCode: 'PRD-C',
            quantity: 1,
            unitPrice: 1000,
            lineTotal: 1000,
            warehouseAllocations: [],
            warehouseStocks: [],
          },
        ],
      };

      const result = InvoiceMapper.toList(details);

      expect(result.lineCount).toBe(1);
      expect(result.orderId).toBe('ord-001');
      expect(result.orderNumber).toBe('ORD-001');
    });

    it('should handle empty lines array', () => {
      const details = {
        id: 'inv-003',
        invoiceNumber: 'FAC-003',
        customerId: 'c3',
        customerName: 'Customer C',
        customerRif: 'J-11111111-1',
        createdBy: 'user-003',
        createdByName: 'Bob Smith',
        orderId: null,
        orderNumber: null,
        status: InvoiceStatus.CANCELLED,
        paymentType: PaymentType.CASH,
        notes: null,
        subtotal: 0,
        cancelledAt: '2025-01-15T10:00:00Z',
        cancelledReason: 'Test',
        createdAt: '2025-01-03T00:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z',
        lines: [],
      };

      const result = InvoiceMapper.toList(details);

      expect(result.lineCount).toBe(0);
    });
  });
});
