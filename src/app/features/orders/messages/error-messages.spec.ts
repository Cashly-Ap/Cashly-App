import { describe, it, expect } from 'vitest';
import { ORDER_ERROR_MESSAGES, ORDER_HTTP_ERRORS } from '@features/orders/messages/error-messages';

describe('ORDER_ERROR_MESSAGES', () => {
  it('should have create error message', () => {
    expect(ORDER_ERROR_MESSAGES.create).toBeDefined();
    expect(ORDER_ERROR_MESSAGES.create.severity).toBe('error');
    expect(ORDER_ERROR_MESSAGES.create.summary).toBe('Error');
    expect(ORDER_ERROR_MESSAGES.create.detail).toBe(
      'Error al crear el pedido. Por favor, intente nuevamente.',
    );
    expect(ORDER_ERROR_MESSAGES.create.life).toBe(5000);
  });

  it('should have update error message', () => {
    expect(ORDER_ERROR_MESSAGES.update).toBeDefined();
    expect(ORDER_ERROR_MESSAGES.update.severity).toBe('error');
    expect(ORDER_ERROR_MESSAGES.update.summary).toBe('Error');
    expect(ORDER_ERROR_MESSAGES.update.detail).toBe(
      'Error al actualizar el pedido. Por favor, intente nuevamente.',
    );
    expect(ORDER_ERROR_MESSAGES.update.life).toBe(5000);
  });

  it('should have load error message', () => {
    expect(ORDER_ERROR_MESSAGES.load).toBeDefined();
    expect(ORDER_ERROR_MESSAGES.load.severity).toBe('error');
    expect(ORDER_ERROR_MESSAGES.load.summary).toBe('Error');
    expect(ORDER_ERROR_MESSAGES.load.detail).toBe(
      'Error al cargar el pedido. Es posible que no exista.',
    );
    expect(ORDER_ERROR_MESSAGES.load.life).toBe(5000);
  });

  it('should have delete error message', () => {
    expect(ORDER_ERROR_MESSAGES.delete).toBeDefined();
    expect(ORDER_ERROR_MESSAGES.delete.severity).toBe('error');
    expect(ORDER_ERROR_MESSAGES.delete.summary).toBe('Error');
    expect(ORDER_ERROR_MESSAGES.delete.detail).toBe(
      'Error al eliminar el pedido. Por favor, intente nuevamente.',
    );
    expect(ORDER_ERROR_MESSAGES.delete.life).toBe(5000);
  });

  it('should have confirm error message', () => {
    expect(ORDER_ERROR_MESSAGES.confirm).toBeDefined();
    expect(ORDER_ERROR_MESSAGES.confirm.severity).toBe('error');
    expect(ORDER_ERROR_MESSAGES.confirm.summary).toBe('Error');
    expect(ORDER_ERROR_MESSAGES.confirm.detail).toBe(
      'Error al confirmar el pedido. Por favor, intente nuevamente.',
    );
    expect(ORDER_ERROR_MESSAGES.confirm.life).toBe(5000);
  });

  it('should have cancel error message', () => {
    expect(ORDER_ERROR_MESSAGES.cancel).toBeDefined();
    expect(ORDER_ERROR_MESSAGES.cancel.severity).toBe('error');
    expect(ORDER_ERROR_MESSAGES.cancel.summary).toBe('Error');
    expect(ORDER_ERROR_MESSAGES.cancel.detail).toBe(
      'Error al cancelar el pedido. Por favor, intente nuevamente.',
    );
    expect(ORDER_ERROR_MESSAGES.cancel.life).toBe(5000);
  });

  it('should have 6 error message types', () => {
    expect(Object.keys(ORDER_ERROR_MESSAGES)).toHaveLength(6);
  });
});

describe('ORDER_HTTP_ERRORS', () => {
  it('should have message for status 0 (connection error)', () => {
    expect(ORDER_HTTP_ERRORS[0]).toBe(
      'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
    );
  });

  it('should have message for status 400', () => {
    expect(ORDER_HTTP_ERRORS[400]).toBe(
      'Los datos del pedido son incorrectos. Verifica la información.',
    );
  });

  it('should have message for status 404', () => {
    expect(ORDER_HTTP_ERRORS[404]).toBe('Pedido no encontrado.');
  });

  it('should have message for status 409', () => {
    expect(ORDER_HTTP_ERRORS[409]).toBe('El pedido no puede ser modificado en su estado actual.');
  });

  it('should have message for status 500', () => {
    expect(ORDER_HTTP_ERRORS[500]).toBe(
      'Error interno del servidor. Por favor, intenta más tarde.',
    );
  });

  it('should have 5 HTTP error mappings', () => {
    expect(Object.keys(ORDER_HTTP_ERRORS)).toHaveLength(5);
  });
});
