import { describe, it, expect } from 'vitest';
import {
  INVOICE_ERROR_MESSAGES,
  INVOICE_HTTP_ERRORS,
  invoiceErrorDetail,
} from '@features/sales/invoices/invoices/messages/error-messages';

describe('INVOICE_ERROR_MESSAGES', () => {
  it('should have create error message', () => {
    expect(INVOICE_ERROR_MESSAGES.create.severity).toBe('error');
    expect(INVOICE_ERROR_MESSAGES.create.detail).toContain('crear');
  });

  it('should have update error message', () => {
    expect(INVOICE_ERROR_MESSAGES.update.severity).toBe('error');
    expect(INVOICE_ERROR_MESSAGES.update.detail).toContain('actualizar');
  });

  it('should have confirm error message', () => {
    expect(INVOICE_ERROR_MESSAGES.confirm.severity).toBe('error');
    expect(INVOICE_ERROR_MESSAGES.confirm.detail).toContain('confirmar');
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

describe('invoiceErrorDetail', () => {
  it('should return the server message when available', () => {
    const detail = invoiceErrorDetail({ error: { message: 'Stock insuficiente' } }, 'fallback');
    expect(detail).toBe('Stock insuficiente');
  });

  it('should return the server error when message is absent', () => {
    const detail = invoiceErrorDetail({ error: { error: 'Factura bloqueada' } }, 'fallback');
    expect(detail).toBe('Factura bloqueada');
  });

  it('should use the HTTP status message when the payload has no text', () => {
    const detail = invoiceErrorDetail({ status: 409, error: {} }, 'fallback');
    expect(detail).toBe(INVOICE_HTTP_ERRORS[409]);
  });

  it('should fall back when the error is unknown', () => {
    expect(invoiceErrorDetail(null, 'fallback')).toBe('fallback');
    expect(invoiceErrorDetail(undefined, 'fallback')).toBe('fallback');
    expect(invoiceErrorDetail({}, 'fallback')).toBe('fallback');
  });
});
