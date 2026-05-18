import { describe, it, expect } from 'vitest';
import { InvoiceDetails, InvoiceLineDetail } from './invoice-details.interface';
import { InvoiceStatus } from '../enums/invoice-status.enum';
import { PaymentType } from '../enums/payment-type.enum';

describe('InvoiceLineDetail interface', () => {
  it('should have all required properties', () => {
    const line: InvoiceLineDetail = {
      id: 'line-001',
      productId: 'p1',
      productName: 'Motor 10HP',
      productCode: 'MOT-10',
      quantity: 5,
      unitPrice: 100,
      lineTotal: 500,
      warehouseAllocations: [
        {
          id: 'alloc-001',
          warehouseId: 'wh-001',
          warehouseCode: 'WH1',
          warehouseName: 'Almacén Central',
          available: 50,
          allocated: 5,
        },
      ],
      warehouseStocks: [
        {
          warehouseId: 'wh-001',
          warehouseCode: 'WH1',
          warehouseName: 'Almacén Central',
          quantity: 50,
          reserved: 10,
          available: 40,
        },
      ],
    };

    expect(line.id).toBe('line-001');
    expect(line.warehouseAllocations).toHaveLength(1);
    expect(line.warehouseStocks).toHaveLength(1);
  });

  it('should allow optional warehouseStocks', () => {
    const line: InvoiceLineDetail = {
      id: 'line-002',
      productId: 'p2',
      productName: 'Product B',
      productCode: 'PRD-B',
      quantity: 1,
      unitPrice: 50,
      lineTotal: 50,
      warehouseAllocations: [],
    };

    expect(line.warehouseStocks).toBeUndefined();
  });
});

describe('InvoiceDetails interface', () => {
  it('should have all required properties', () => {
    const invoice: InvoiceDetails = {
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
      lines: [],
    };

    expect(invoice.id).toBe('inv-001');
    expect(invoice.customerRif).toBe('J-12345678-9');
    expect(invoice.createdByName).toBe('John Doe');
    expect(invoice.lines).toEqual([]);
  });

  it('should accept cancelled invoice fields', () => {
    const invoice: InvoiceDetails = {
      id: 'inv-002',
      invoiceNumber: 'FAC-002',
      customerId: 'c2',
      customerName: 'Customer B',
      customerRif: 'J-98765432-1',
      createdBy: 'user-002',
      createdByName: 'Jane Doe',
      orderId: null,
      orderNumber: null,
      status: InvoiceStatus.CANCELLED,
      paymentType: PaymentType.CREDIT,
      notes: null,
      subtotal: 0,
      cancelledAt: '2025-01-15T10:00:00Z',
      cancelledReason: 'Customer request',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z',
      lines: [],
    };

    expect(invoice.cancelledAt).toBe('2025-01-15T10:00:00Z');
    expect(invoice.cancelledReason).toBe('Customer request');
  });
});
