import { describe, it, expect } from 'vitest';
import { USER_ERROR_MESSAGES, USER_HTTP_ERRORS } from './error-messages';

describe('USER_ERROR_MESSAGES', () => {
  it('should have create, update, load, and delete keys', () => {
    expect(Object.keys(USER_ERROR_MESSAGES)).toEqual(['create', 'update', 'load', 'delete']);
  });

  it('should have correct structure for each message', () => {
    Object.values(USER_ERROR_MESSAGES).forEach((msg) => {
      expect(msg).toHaveProperty('summary');
      expect(msg).toHaveProperty('detail');
    });
  });

  it('should have correct create message', () => {
    expect(USER_ERROR_MESSAGES.create.summary).toBe('Error');
    expect(USER_ERROR_MESSAGES.create.detail).toContain('crear');
  });

  it('should have correct update message', () => {
    expect(USER_ERROR_MESSAGES.update.summary).toBe('Error');
    expect(USER_ERROR_MESSAGES.update.detail).toContain('actualizar');
  });

  it('should have correct load message', () => {
    expect(USER_ERROR_MESSAGES.load.summary).toBe('Error');
    expect(USER_ERROR_MESSAGES.load.detail).toContain('cargar');
  });

  it('should have correct delete message', () => {
    expect(USER_ERROR_MESSAGES.delete.summary).toBe('Error');
    expect(USER_ERROR_MESSAGES.delete.detail).toContain('eliminar');
  });
});

describe('USER_HTTP_ERRORS', () => {
  it('should have expected HTTP status codes', () => {
    expect(Object.keys(USER_HTTP_ERRORS).map(Number)).toEqual([0, 400, 404, 409, 500]);
  });

  it('should have string values for all status codes', () => {
    Object.values(USER_HTTP_ERRORS).forEach((msg) => {
      expect(typeof msg).toBe('string');
      expect(msg.length).toBeGreaterThan(0);
    });
  });

  it('should have meaningful messages for each status code', () => {
    expect(USER_HTTP_ERRORS[0]).toContain('conectar');
    expect(USER_HTTP_ERRORS[400]).toContain('incorrectos');
    expect(USER_HTTP_ERRORS[404]).toContain('no encontrado');
    expect(USER_HTTP_ERRORS[409]).toContain('correo');
    expect(USER_HTTP_ERRORS[500]).toContain('servidor');
  });
});
