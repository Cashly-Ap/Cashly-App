import { describe, it, expect } from 'vitest';
import {
  CUSTOMER_ERROR_MESSAGES,
  CUSTOMER_HTTP_ERRORS,
} from '@features/customers/messages/error-messages';

describe('CUSTOMER_ERROR_MESSAGES', () => {
  it('should have create, update, load, and delete keys', () => {
    expect(Object.keys(CUSTOMER_ERROR_MESSAGES)).toEqual([
      'create',
      'update',
      'load',
      'delete',
    ]);
  });

  it('should have correct structure for each message', () => {
    Object.values(CUSTOMER_ERROR_MESSAGES).forEach((msg) => {
      expect(msg).toHaveProperty('severity');
      expect(msg).toHaveProperty('summary');
      expect(msg).toHaveProperty('detail');
      expect(msg).toHaveProperty('life');
    });
  });

  it('should have error severity for all messages', () => {
    Object.values(CUSTOMER_ERROR_MESSAGES).forEach((msg) => {
      expect(msg.severity).toBe('error');
    });
  });

  it('should have life of 5000 for all messages', () => {
    Object.values(CUSTOMER_ERROR_MESSAGES).forEach((msg) => {
      expect(msg.life).toBe(5000);
    });
  });

  it('should have correct create message', () => {
    expect(CUSTOMER_ERROR_MESSAGES.create.summary).toBe('Error');
    expect(CUSTOMER_ERROR_MESSAGES.create.detail).toContain('crear');
  });

  it('should have correct update message', () => {
    expect(CUSTOMER_ERROR_MESSAGES.update.summary).toBe('Error');
    expect(CUSTOMER_ERROR_MESSAGES.update.detail).toContain('actualizar');
  });

  it('should have correct load message', () => {
    expect(CUSTOMER_ERROR_MESSAGES.load.summary).toBe('Error');
    expect(CUSTOMER_ERROR_MESSAGES.load.detail).toContain('cargar');
  });

  it('should have correct delete message', () => {
    expect(CUSTOMER_ERROR_MESSAGES.delete.summary).toBe('Error');
    expect(CUSTOMER_ERROR_MESSAGES.delete.detail).toContain('eliminar');
  });
});

describe('CUSTOMER_HTTP_ERRORS', () => {
  it('should have expected HTTP status codes', () => {
    expect(Object.keys(CUSTOMER_HTTP_ERRORS).map(Number)).toEqual([0, 400, 404, 409, 500]);
  });

  it('should have string values for all status codes', () => {
    Object.values(CUSTOMER_HTTP_ERRORS).forEach((msg) => {
      expect(typeof msg).toBe('string');
      expect(msg.length).toBeGreaterThan(0);
    });
  });

  it('should have meaningful messages for each status code', () => {
    expect(CUSTOMER_HTTP_ERRORS[0]).toContain('conectar');
    expect(CUSTOMER_HTTP_ERRORS[400]).toContain('incorrectos');
    expect(CUSTOMER_HTTP_ERRORS[404]).toContain('no encontrado');
    expect(CUSTOMER_HTTP_ERRORS[409]).toContain('RIF');
    expect(CUSTOMER_HTTP_ERRORS[500]).toContain('servidor');
  });
});
