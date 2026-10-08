import { describe, it, expect } from 'vitest';
import { CUSTOMER_SUCCESS_MESSAGES } from '@features/customers/messages/success-messages';

describe('CUSTOMER_SUCCESS_MESSAGES', () => {
  it('should have created, updated, and deleted keys', () => {
    expect(Object.keys(CUSTOMER_SUCCESS_MESSAGES)).toEqual([
      'created',
      'updated',
      'deleted',
    ]);
  });

  it('should have correct structure for each message', () => {
    Object.values(CUSTOMER_SUCCESS_MESSAGES).forEach((msg) => {
      expect(msg).toHaveProperty('severity');
      expect(msg).toHaveProperty('summary');
      expect(msg).toHaveProperty('detail');
      expect(msg).toHaveProperty('life');
    });
  });

  it('should have success severity for all messages', () => {
    Object.values(CUSTOMER_SUCCESS_MESSAGES).forEach((msg) => {
      expect(msg.severity).toBe('success');
    });
  });

  it('should have life of 3000 for all messages', () => {
    Object.values(CUSTOMER_SUCCESS_MESSAGES).forEach((msg) => {
      expect(msg.life).toBe(3000);
    });
  });

  it('should have correct summary for all messages', () => {
    Object.values(CUSTOMER_SUCCESS_MESSAGES).forEach((msg) => {
      expect(msg.summary).toBe('Éxito');
    });
  });

  it('should have correct created message', () => {
    expect(CUSTOMER_SUCCESS_MESSAGES.created.detail).toBe('Cliente creado exitosamente');
  });

  it('should have correct updated message', () => {
    expect(CUSTOMER_SUCCESS_MESSAGES.updated.detail).toBe('Cliente actualizado exitosamente');
  });

  it('should have correct deleted message', () => {
    expect(CUSTOMER_SUCCESS_MESSAGES.deleted.detail).toBe('Cliente eliminado exitosamente');
  });
});
