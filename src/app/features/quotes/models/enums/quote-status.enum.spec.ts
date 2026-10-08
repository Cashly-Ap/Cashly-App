import { describe, it, expect } from 'vitest';
import {
  QuoteStatus,
  QUOTE_STATUS_LABELS,
  getQuoteStatusLabel,
} from '@features/quotes/models/enums/quote-status.enum';

describe('QuoteStatus', () => {
  it('should have DRAFT value', () => {
    expect(QuoteStatus.DRAFT).toBe('DRAFT');
  });

  it('should have CONVERTED_TO_ORDER value', () => {
    expect(QuoteStatus.CONVERTED_TO_ORDER).toBe('CONVERTED_TO_ORDER');
  });

  it('should have CONVERTED_TO_INVOICE value', () => {
    expect(QuoteStatus.CONVERTED_TO_INVOICE).toBe('CONVERTED_TO_INVOICE');
  });

  it('should have CANCELLED value', () => {
    expect(QuoteStatus.CANCELLED).toBe('CANCELLED');
  });

  it('should have 4 values', () => {
    expect(Object.keys(QuoteStatus).filter((k) => isNaN(Number(k)))).toHaveLength(4);
  });
});

describe('QUOTE_STATUS_LABELS', () => {
  it('should have label for DRAFT', () => {
    expect(QUOTE_STATUS_LABELS[QuoteStatus.DRAFT]).toBe('Borrador');
  });

  it('should have label for CONVERTED_TO_ORDER', () => {
    expect(QUOTE_STATUS_LABELS[QuoteStatus.CONVERTED_TO_ORDER]).toBe('Convertido a Pedido');
  });

  it('should have label for CONVERTED_TO_INVOICE', () => {
    expect(QUOTE_STATUS_LABELS[QuoteStatus.CONVERTED_TO_INVOICE]).toBe('Convertido a Factura');
  });

  it('should have label for CANCELLED', () => {
    expect(QUOTE_STATUS_LABELS[QuoteStatus.CANCELLED]).toBe('Cancelado');
  });
});

describe('getQuoteStatusLabel', () => {
  it('should return label for valid status', () => {
    expect(getQuoteStatusLabel(QuoteStatus.DRAFT)).toBe('Borrador');
    expect(getQuoteStatusLabel(QuoteStatus.CONVERTED_TO_ORDER)).toBe('Convertido a Pedido');
    expect(getQuoteStatusLabel(QuoteStatus.CONVERTED_TO_INVOICE)).toBe('Convertido a Factura');
    expect(getQuoteStatusLabel(QuoteStatus.CANCELLED)).toBe('Cancelado');
  });

  it('should return status string for unknown value', () => {
    expect(getQuoteStatusLabel('UNKNOWN' as any)).toBe('UNKNOWN');
  });
});
