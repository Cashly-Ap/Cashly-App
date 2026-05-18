import { describe, it, expect } from 'vitest';
import { InvoiceStatus, INVOICE_STATUS_LABELS, getInvoiceStatusLabel } from './invoice-status.enum';

describe('InvoiceStatus', () => {
  it('should have DRAFT value', () => {
    expect(InvoiceStatus.DRAFT).toBe('DRAFT');
  });

  it('should have PENDING_PAYMENT value', () => {
    expect(InvoiceStatus.PENDING_PAYMENT).toBe('PENDING_PAYMENT');
  });

  it('should have PARTIALLY_PAID value', () => {
    expect(InvoiceStatus.PARTIALLY_PAID).toBe('PARTIALLY_PAID');
  });

  it('should have PAID value', () => {
    expect(InvoiceStatus.PAID).toBe('PAID');
  });

  it('should have CANCELLED value', () => {
    expect(InvoiceStatus.CANCELLED).toBe('CANCELLED');
  });

  it('should have 5 values', () => {
    expect(Object.keys(InvoiceStatus).filter((k) => isNaN(Number(k)))).toHaveLength(5);
  });
});

describe('INVOICE_STATUS_LABELS', () => {
  it('should have label for DRAFT', () => {
    expect(INVOICE_STATUS_LABELS[InvoiceStatus.DRAFT]).toBe('Borrador');
  });

  it('should have label for PENDING_PAYMENT', () => {
    expect(INVOICE_STATUS_LABELS[InvoiceStatus.PENDING_PAYMENT]).toBe('Pendiente de Pago');
  });

  it('should have label for PARTIALLY_PAID', () => {
    expect(INVOICE_STATUS_LABELS[InvoiceStatus.PARTIALLY_PAID]).toBe('Parcialmente Pagada');
  });

  it('should have label for PAID', () => {
    expect(INVOICE_STATUS_LABELS[InvoiceStatus.PAID]).toBe('Pagada');
  });

  it('should have label for CANCELLED', () => {
    expect(INVOICE_STATUS_LABELS[InvoiceStatus.CANCELLED]).toBe('Cancelada');
  });
});

describe('getInvoiceStatusLabel', () => {
  it('should return label for valid status', () => {
    expect(getInvoiceStatusLabel(InvoiceStatus.DRAFT)).toBe('Borrador');
    expect(getInvoiceStatusLabel(InvoiceStatus.PAID)).toBe('Pagada');
  });

  it('should return status string for unknown value', () => {
    expect(getInvoiceStatusLabel('UNKNOWN' as any)).toBe('UNKNOWN');
  });
});
