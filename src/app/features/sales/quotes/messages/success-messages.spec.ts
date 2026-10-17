import { describe, it, expect } from 'vitest';
import { QUOTE_SUCCESS_MESSAGES } from '@features/sales/quotes/messages/success-messages';

describe('QUOTE_SUCCESS_MESSAGES', () => {
  it('should have created message with correct severity and detail', () => {
    expect(QUOTE_SUCCESS_MESSAGES.created.severity).toBe('success');
    expect(QUOTE_SUCCESS_MESSAGES.created.summary).toBe('Éxito');
    expect(QUOTE_SUCCESS_MESSAGES.created.detail).toBe('Presupuesto creado exitosamente');
    expect(QUOTE_SUCCESS_MESSAGES.created.life).toBe(3000);
  });

  it('should have updated message with correct severity and detail', () => {
    expect(QUOTE_SUCCESS_MESSAGES.updated.severity).toBe('success');
    expect(QUOTE_SUCCESS_MESSAGES.updated.summary).toBe('Éxito');
    expect(QUOTE_SUCCESS_MESSAGES.updated.detail).toBe('Presupuesto actualizado exitosamente');
    expect(QUOTE_SUCCESS_MESSAGES.updated.life).toBe(3000);
  });

  it('should have deleted message with correct severity and detail', () => {
    expect(QUOTE_SUCCESS_MESSAGES.deleted.severity).toBe('success');
    expect(QUOTE_SUCCESS_MESSAGES.deleted.summary).toBe('Éxito');
    expect(QUOTE_SUCCESS_MESSAGES.deleted.detail).toBe('Presupuesto eliminado exitosamente');
    expect(QUOTE_SUCCESS_MESSAGES.deleted.life).toBe(3000);
  });

  it('should have convertedToOrder message with correct severity and detail', () => {
    expect(QUOTE_SUCCESS_MESSAGES.convertedToOrder.severity).toBe('success');
    expect(QUOTE_SUCCESS_MESSAGES.convertedToOrder.summary).toBe('Éxito');
    expect(QUOTE_SUCCESS_MESSAGES.convertedToOrder.detail).toBe(
      'Presupuesto convertido a pedido exitosamente',
    );
    expect(QUOTE_SUCCESS_MESSAGES.convertedToOrder.life).toBe(3000);
  });

  it('should have convertedToInvoice message with correct severity and detail', () => {
    expect(QUOTE_SUCCESS_MESSAGES.convertedToInvoice.severity).toBe('success');
    expect(QUOTE_SUCCESS_MESSAGES.convertedToInvoice.summary).toBe('Éxito');
    expect(QUOTE_SUCCESS_MESSAGES.convertedToInvoice.detail).toBe(
      'Presupuesto convertido a factura exitosamente',
    );
    expect(QUOTE_SUCCESS_MESSAGES.convertedToInvoice.life).toBe(3000);
  });

  it('should have 5 message keys', () => {
    expect(Object.keys(QUOTE_SUCCESS_MESSAGES)).toHaveLength(5);
  });
});
