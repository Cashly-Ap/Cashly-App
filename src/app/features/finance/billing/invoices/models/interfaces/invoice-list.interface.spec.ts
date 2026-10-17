import { describe, it, expect } from 'vitest';
import { InvoiceList } from '@features/finance/billing/invoices/models/interfaces/invoice-list.interface';
import { InvoiceStatus } from '@features/finance/billing/invoices/models/enums/invoice-status.enum';
import { PaymentType } from '@features/finance/billing/invoices/models/enums/payment-type.enum';

describe('InvoiceList interface', () => {
  it('should have all required properties', () => {
    const obj: InvoiceList = {
      id: 'inv-001',
      invoiceNumber: 'FAC-001',
      customerId: 'c1',
      customerName: 'Test Customer',
      status: InvoiceStatus.DRAFT,
      paymentType: PaymentType.CASH,
      subtotal: 100,
      total: 100,
      paidAmount: 0,
      creditApplied: 0,
      debitApplied: 0,
      lineCount: 2,
      orderId: null,
      orderNumber: null,
      createdAt: '2025-01-01T00:00:00Z',
      returnStatus: null,
    };

    expect(obj.id).toBe('inv-001');
    expect(obj.invoiceNumber).toBe('FAC-001');
    expect(obj.customerId).toBe('c1');
    expect(obj.customerName).toBe('Test Customer');
    expect(obj.status).toBe(InvoiceStatus.DRAFT);
    expect(obj.paymentType).toBe(PaymentType.CASH);
    expect(obj.subtotal).toBe(100);
    expect(obj.total).toBe(100);
    expect(obj.paidAmount).toBe(0);
    expect(obj.creditApplied).toBe(0);
    expect(obj.debitApplied).toBe(0);
    expect(obj.lineCount).toBe(2);
    expect(obj.orderId).toBeNull();
    expect(obj.orderNumber).toBeNull();
    expect(obj.createdAt).toBe('2025-01-01T00:00:00Z');
    expect(obj.returnStatus).toBeNull();
  });

  it('should accept non-null orderId and orderNumber', () => {
    const obj: InvoiceList = {
      id: 'inv-002',
      invoiceNumber: 'FAC-002',
      customerId: 'c2',
      customerName: 'Customer B',
      status: InvoiceStatus.PAID,
      paymentType: PaymentType.CREDIT,
      subtotal: 200,
      total: 200,
      paidAmount: 200,
      creditApplied: 0,
      debitApplied: 0,
      lineCount: 3,
      orderId: 'ord-001',
      orderNumber: 'ORD-001',
      createdAt: '2025-01-02T00:00:00Z',
      returnStatus: null,
    };

    expect(obj.orderId).toBe('ord-001');
    expect(obj.orderNumber).toBe('ORD-001');
  });
});
