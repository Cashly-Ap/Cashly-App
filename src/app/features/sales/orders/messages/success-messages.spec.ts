import { describe, it, expect } from 'vitest';
import { ORDER_SUCCESS_MESSAGES } from '@features/sales/orders/messages/success-messages';

describe('ORDER_SUCCESS_MESSAGES', () => {
  it('should have created message', () => {
    expect(ORDER_SUCCESS_MESSAGES.created).toBeDefined();
    expect(ORDER_SUCCESS_MESSAGES.created.severity).toBe('success');
    expect(ORDER_SUCCESS_MESSAGES.created.summary).toBe('Éxito');
    expect(ORDER_SUCCESS_MESSAGES.created.detail).toBe('Pedido creado exitosamente');
    expect(ORDER_SUCCESS_MESSAGES.created.life).toBe(3000);
  });

  it('should have updated message', () => {
    expect(ORDER_SUCCESS_MESSAGES.updated).toBeDefined();
    expect(ORDER_SUCCESS_MESSAGES.updated.severity).toBe('success');
    expect(ORDER_SUCCESS_MESSAGES.updated.summary).toBe('Éxito');
    expect(ORDER_SUCCESS_MESSAGES.updated.detail).toBe('Pedido actualizado exitosamente');
    expect(ORDER_SUCCESS_MESSAGES.updated.life).toBe(3000);
  });

  it('should have deleted message', () => {
    expect(ORDER_SUCCESS_MESSAGES.deleted).toBeDefined();
    expect(ORDER_SUCCESS_MESSAGES.deleted.severity).toBe('success');
    expect(ORDER_SUCCESS_MESSAGES.deleted.summary).toBe('Éxito');
    expect(ORDER_SUCCESS_MESSAGES.deleted.detail).toBe('Pedido eliminado exitosamente');
    expect(ORDER_SUCCESS_MESSAGES.deleted.life).toBe(3000);
  });

  it('should have confirmed message', () => {
    expect(ORDER_SUCCESS_MESSAGES.confirmed).toBeDefined();
    expect(ORDER_SUCCESS_MESSAGES.confirmed.severity).toBe('success');
    expect(ORDER_SUCCESS_MESSAGES.confirmed.summary).toBe('Éxito');
    expect(ORDER_SUCCESS_MESSAGES.confirmed.detail).toBe('Pedido confirmado exitosamente');
    expect(ORDER_SUCCESS_MESSAGES.confirmed.life).toBe(3000);
  });

  it('should have cancelled message', () => {
    expect(ORDER_SUCCESS_MESSAGES.cancelled).toBeDefined();
    expect(ORDER_SUCCESS_MESSAGES.cancelled.severity).toBe('success');
    expect(ORDER_SUCCESS_MESSAGES.cancelled.summary).toBe('Éxito');
    expect(ORDER_SUCCESS_MESSAGES.cancelled.detail).toBe('Pedido cancelado exitosamente');
    expect(ORDER_SUCCESS_MESSAGES.cancelled.life).toBe(3000);
  });

  it('should have 5 message types', () => {
    expect(Object.keys(ORDER_SUCCESS_MESSAGES)).toHaveLength(5);
  });
});
