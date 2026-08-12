import { describe, it, expect } from 'vitest';
import {
  AUTH_HTTP_ERRORS,
  AUTH_DEFAULT_ERROR_MESSAGE,
  AUTH_ERROR_MESSAGES,
  AUTH_SESSION_MESSAGES,
} from '@features/auth/messages/error-messages';

describe('AUTH_HTTP_ERRORS', () => {
  it('should have expected HTTP status codes', () => {
    expect(Object.keys(AUTH_HTTP_ERRORS).map(Number)).toEqual([
      0, 400, 401, 403, 404, 500, 503, 504,
    ]);
  });

  it('should have string values for all status codes', () => {
    Object.values(AUTH_HTTP_ERRORS).forEach((msg) => {
      expect(typeof msg).toBe('string');
      expect(msg.length).toBeGreaterThan(0);
    });
  });

  it('should have meaningful messages for each status code', () => {
    expect(AUTH_HTTP_ERRORS[0]).toContain('conectar');
    expect(AUTH_HTTP_ERRORS[400]).toContain('incorrectos');
    expect(AUTH_HTTP_ERRORS[401]).toContain('Credenciales');
    expect(AUTH_HTTP_ERRORS[403]).toContain('permisos');
    expect(AUTH_HTTP_ERRORS[404]).toContain('no encontrado');
    expect(AUTH_HTTP_ERRORS[500]).toContain('servidor');
    expect(AUTH_HTTP_ERRORS[503]).toContain('disponible');
    expect(AUTH_HTTP_ERRORS[504]).toContain('demasiado');
  });
});

describe('AUTH_DEFAULT_ERROR_MESSAGE', () => {
  it('should be a non-empty string', () => {
    expect(typeof AUTH_DEFAULT_ERROR_MESSAGE).toBe('string');
    expect(AUTH_DEFAULT_ERROR_MESSAGE.length).toBeGreaterThan(0);
  });

  it('should contain error context', () => {
    expect(AUTH_DEFAULT_ERROR_MESSAGE).toContain('error');
  });
});

describe('AUTH_ERROR_MESSAGES', () => {
  it('should have expected keys', () => {
    const keys = Object.keys(AUTH_ERROR_MESSAGES);
    expect(keys).toContain('changePassword');
    expect(keys).toContain('changeUsername');
    expect(keys).toContain('changeCommissionDeduction');
    expect(keys).toContain('sessionExpired');
    expect(keys).toContain('connectionError');
    expect(keys).toContain('serverError');
    expect(keys).toContain('loginError');
  });

  it('should have correct structure for each message', () => {
    Object.values(AUTH_ERROR_MESSAGES).forEach((msg) => {
      expect(msg).toHaveProperty('severity');
      expect(msg).toHaveProperty('summary');
      expect(msg).toHaveProperty('detail');
    });
  });

  it('should have correct changePassword message', () => {
    expect(AUTH_ERROR_MESSAGES.changePassword.severity).toBe('error');
    expect(AUTH_ERROR_MESSAGES.changePassword.detail).toContain('contraseña');
  });

  it('should have correct changeUsername message', () => {
    expect(AUTH_ERROR_MESSAGES.changeUsername.severity).toBe('error');
    expect(AUTH_ERROR_MESSAGES.changeUsername.detail).toContain('nombre de usuario');
  });

  it('should have correct changeCommissionDeduction message', () => {
    expect(AUTH_ERROR_MESSAGES.changeCommissionDeduction.severity).toBe('error');
    expect(AUTH_ERROR_MESSAGES.changeCommissionDeduction.detail).toContain('deducible');
  });

  it('should have correct sessionExpired message', () => {
    expect(AUTH_ERROR_MESSAGES.sessionExpired.severity).toBe('warn');
    expect(AUTH_ERROR_MESSAGES.sessionExpired.summary).toBe('Sesión Expirada');
  });
});

describe('AUTH_SESSION_MESSAGES', () => {
  it('should have expected keys', () => {
    const keys = Object.keys(AUTH_SESSION_MESSAGES);
    expect(keys).toContain('expired');
    expect(keys).toContain('connectionError');
    expect(keys).toContain('serverError');
    expect(keys).toContain('loginError');
  });

  it('should have correct structure for each message', () => {
    Object.values(AUTH_SESSION_MESSAGES).forEach((msg) => {
      expect(msg).toHaveProperty('severity');
      expect(msg).toHaveProperty('summary');
      expect(msg).toHaveProperty('detail');
    });
  });

  it('should have correct expired message', () => {
    expect(AUTH_SESSION_MESSAGES.expired.severity).toBe('warn');
    expect(AUTH_SESSION_MESSAGES.expired.summary).toBe('Sesión Expirada');
  });
});
