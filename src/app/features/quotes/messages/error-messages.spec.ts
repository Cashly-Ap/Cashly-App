import { describe, it, expect } from 'vitest';
import { QUOTE_ERROR_MESSAGES, QUOTE_HTTP_ERRORS } from './error-messages';

describe('QUOTE_ERROR_MESSAGES', () => {
  it('should have create error with correct severity and detail', () => {
    expect(QUOTE_ERROR_MESSAGES.create.severity).toBe('error');
    expect(QUOTE_ERROR_MESSAGES.create.summary).toBe('Error');
    expect(QUOTE_ERROR_MESSAGES.create.detail).toBe(
      'Error al crear el presupuesto. Por favor, intente nuevamente.',
    );
    expect(QUOTE_ERROR_MESSAGES.create.life).toBe(5000);
  });

  it('should have update error with correct severity and detail', () => {
    expect(QUOTE_ERROR_MESSAGES.update.severity).toBe('error');
    expect(QUOTE_ERROR_MESSAGES.update.summary).toBe('Error');
    expect(QUOTE_ERROR_MESSAGES.update.detail).toBe(
      'Error al actualizar el presupuesto. Por favor, intente nuevamente.',
    );
    expect(QUOTE_ERROR_MESSAGES.update.life).toBe(5000);
  });

  it('should have load error with correct severity and detail', () => {
    expect(QUOTE_ERROR_MESSAGES.load.severity).toBe('error');
    expect(QUOTE_ERROR_MESSAGES.load.summary).toBe('Error');
    expect(QUOTE_ERROR_MESSAGES.load.detail).toBe(
      'Error al cargar el presupuesto. Es posible que no exista.',
    );
    expect(QUOTE_ERROR_MESSAGES.load.life).toBe(5000);
  });

  it('should have delete error with correct severity and detail', () => {
    expect(QUOTE_ERROR_MESSAGES.delete.severity).toBe('error');
    expect(QUOTE_ERROR_MESSAGES.delete.summary).toBe('Error');
    expect(QUOTE_ERROR_MESSAGES.delete.detail).toBe(
      'Error al eliminar el presupuesto. Por favor, intente nuevamente.',
    );
    expect(QUOTE_ERROR_MESSAGES.delete.life).toBe(5000);
  });

  it('should have convertToOrder error with correct severity and detail', () => {
    expect(QUOTE_ERROR_MESSAGES.convertToOrder.severity).toBe('error');
    expect(QUOTE_ERROR_MESSAGES.convertToOrder.summary).toBe('Error');
    expect(QUOTE_ERROR_MESSAGES.convertToOrder.detail).toBe(
      'Error al convertir el presupuesto a pedido. Por favor, intente nuevamente.',
    );
    expect(QUOTE_ERROR_MESSAGES.convertToOrder.life).toBe(5000);
  });

  it('should have convertToInvoice error with correct severity and detail', () => {
    expect(QUOTE_ERROR_MESSAGES.convertToInvoice.severity).toBe('error');
    expect(QUOTE_ERROR_MESSAGES.convertToInvoice.summary).toBe('Error');
    expect(QUOTE_ERROR_MESSAGES.convertToInvoice.detail).toBe(
      'Error al convertir el presupuesto a factura. Por favor, intente nuevamente.',
    );
    expect(QUOTE_ERROR_MESSAGES.convertToInvoice.life).toBe(5000);
  });

  it('should have 6 error message keys', () => {
    expect(Object.keys(QUOTE_ERROR_MESSAGES)).toHaveLength(6);
  });
});

describe('QUOTE_HTTP_ERRORS', () => {
  it('should have message for status 0 (connection)', () => {
    expect(QUOTE_HTTP_ERRORS[0]).toBe(
      'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
    );
  });

  it('should have message for status 400', () => {
    expect(QUOTE_HTTP_ERRORS[400]).toBe(
      'Los datos del presupuesto son incorrectos. Verifica la información.',
    );
  });

  it('should have message for status 404', () => {
    expect(QUOTE_HTTP_ERRORS[404]).toBe('Presupuesto no encontrado.');
  });

  it('should have message for status 409', () => {
    expect(QUOTE_HTTP_ERRORS[409]).toBe(
      'El presupuesto no puede ser modificado en su estado actual.',
    );
  });

  it('should have message for status 500', () => {
    expect(QUOTE_HTTP_ERRORS[500]).toBe(
      'Error interno del servidor. Por favor, intenta más tarde.',
    );
  });

  it('should have 5 HTTP error keys', () => {
    expect(Object.keys(QUOTE_HTTP_ERRORS)).toHaveLength(5);
  });
});
