import { describe, it, expect } from 'vitest';
import {
  INVOICE_ERROR_MESSAGES,
  INVOICE_HTTP_ERRORS,
} from '@features/finance/billing/invoices/messages/error-messages';

describe('INVOICE_ERROR_MESSAGES', () => {
  it('should have create error message', () => {
    expect(INVOICE_ERROR_MESSAGES.create.severity).toBe('error');
    expect(INVOICE_ERROR_MESSAGES.create.detail).toContain('crear');
  });

  it('should have load error message', () => {
    expect(INVOICE_ERROR_MESSAGES.load.severity).toBe('error');
    expect(INVOICE_ERROR_MESSAGES.load.detail).toContain('cargar');
  });

  it('should have cancel error message', () => {
    expect(INVOICE_ERROR_MESSAGES.cancel.severity).toBe('error');
    expect(INVOICE_ERROR_MESSAGES.cancel.detail).toContain('cancelar');
  });

  it('should have duplicate error message', () => {
    expect(INVOICE_ERROR_MESSAGES.duplicate.severity).toBe('error');
    expect(INVOICE_ERROR_MESSAGES.duplicate.detail).toContain('duplicar');
  });

  it('should all have Error summary', () => {
    Object.values(INVOICE_ERROR_MESSAGES).forEach((msg) => {
      expect(msg.summary).toBe('Error');
      expect(msg.life).toBe(5000);
    });
  });
});

describe('INVOICE_HTTP_ERRORS', () => {
  it('should have message for 400', () => {
    expect(INVOICE_HTTP_ERRORS[400]).toContain('incorrectos');
  });

  it('should have message for 404', () => {
    expect(INVOICE_HTTP_ERRORS[404]).toContain('no encontrada');
  });

  it('should have message for 409', () => {
    expect(INVOICE_HTTP_ERRORS[409]).toContain('modificada');
  });

  it('should have message for 500', () => {
    expect(INVOICE_HTTP_ERRORS[500]).toContain('interno');
  });

  it('should have message for 0 (network error)', () => {
    expect(INVOICE_HTTP_ERRORS[0]).toContain('conectar');
  });
});
