import { describe, it, expect } from 'vitest';
import { INVOICE_SUCCESS_MESSAGES } from '@features/finance/billing/invoices/messages/success-messages';

describe('INVOICE_SUCCESS_MESSAGES', () => {
  it('should have created message', () => {
    expect(INVOICE_SUCCESS_MESSAGES.created.severity).toBe('success');
    expect(INVOICE_SUCCESS_MESSAGES.created.detail).toContain('creada');
    expect(INVOICE_SUCCESS_MESSAGES.created.life).toBe(3000);
  });

  it('should have updated message', () => {
    expect(INVOICE_SUCCESS_MESSAGES.updated.severity).toBe('success');
    expect(INVOICE_SUCCESS_MESSAGES.updated.detail).toContain('actualizada');
  });

  it('should have cancelled message', () => {
    expect(INVOICE_SUCCESS_MESSAGES.cancelled.severity).toBe('success');
    expect(INVOICE_SUCCESS_MESSAGES.cancelled.detail).toContain('cancelada');
  });

  it('should have duplicated message', () => {
    expect(INVOICE_SUCCESS_MESSAGES.duplicated.severity).toBe('success');
    expect(INVOICE_SUCCESS_MESSAGES.duplicated.detail).toContain('duplicada');
  });

  it('should all have Éxito summary', () => {
    Object.values(INVOICE_SUCCESS_MESSAGES).forEach((msg) => {
      expect(msg.summary).toBe('Éxito');
    });
  });
});
