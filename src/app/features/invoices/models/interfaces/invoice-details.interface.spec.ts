import { describe, it, expect } from 'vitest';
import {
  InvoiceDetails,
  InvoiceLineDetail,
  NoteInfo,
} from '@features/invoices/models/interfaces/invoice-details.interface';
import { InvoiceStatus } from '@features/invoices/models/enums/invoice-status.enum';
import { PaymentType } from '@features/invoices/models/enums/payment-type.enum';

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

describe('NoteInfo interface', () => {
  it('should have all required properties', () => {
    const note: NoteInfo = {
      id: 'note-001',
      noteNumber: 'NC-2026-00001',
      type: 'CREDIT',
      amount: 200,
      reason: 'Damaged goods',
      applicationDate: '2026-05-28T10:00:00Z',
    };

    expect(note.id).toBe('note-001');
    expect(note.noteNumber).toBe('NC-2026-00001');
    expect(note.type).toBe('CREDIT');
    expect(note.amount).toBe(200);
    expect(note.reason).toBe('Damaged goods');
  });

  it('should accept DEBIT type', () => {
    const note: NoteInfo = {
      id: 'note-002',
      noteNumber: 'ND-2026-00001',
      type: 'DEBIT',
      amount: 150,
      reason: 'Extra shipping',
      applicationDate: '2026-05-28T11:00:00Z',
    };

    expect(note.type).toBe('DEBIT');
    expect(note.amount).toBe(150);
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
      creditApplied: 0,
      debitApplied: 0,
      total: 500,
      notesList: [],
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
    expect(invoice.creditApplied).toBe(0);
    expect(invoice.debitApplied).toBe(0);
    expect(invoice.total).toBe(500);
    expect(invoice.notesList).toEqual([]);
  });

  it('should accept note data with computed total', () => {
    const invoice: InvoiceDetails = {
      id: 'inv-003',
      invoiceNumber: 'FAC-003',
      customerId: 'c3',
      customerName: 'Customer C',
      customerRif: 'J-11111111-1',
      createdBy: 'user-003',
      createdByName: 'Alice',
      orderId: null,
      orderNumber: null,
      status: InvoiceStatus.PENDING_PAYMENT,
      paymentType: PaymentType.CREDIT,
      notes: null,
      subtotal: 1000,
      creditApplied: 200,
      debitApplied: 50,
      total: 850,
      notesList: [
        {
          id: 'n1',
          noteNumber: 'NC-2026-00001',
          type: 'CREDIT',
          amount: 200,
          reason: 'Discount',
          applicationDate: '2026-05-28T10:00:00Z',
        },
        {
          id: 'n2',
          noteNumber: 'ND-2026-00001',
          type: 'DEBIT',
          amount: 50,
          reason: 'Charge',
          applicationDate: '2026-05-28T11:00:00Z',
        },
      ],
      cancelledAt: null,
      cancelledReason: null,
      createdAt: '2026-05-28T00:00:00Z',
      updatedAt: '2026-05-28T00:00:00Z',
      lines: [],
    };

    expect(invoice.creditApplied).toBe(200);
    expect(invoice.debitApplied).toBe(50);
    expect(invoice.total).toBe(850);
    expect(invoice.notesList).toHaveLength(2);
    expect(invoice.notesList.map((note) => note.noteNumber)).toEqual([
      'NC-2026-00001',
      'ND-2026-00001',
    ]);
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
      creditApplied: 0,
      debitApplied: 0,
      total: 0,
      notesList: [],
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
