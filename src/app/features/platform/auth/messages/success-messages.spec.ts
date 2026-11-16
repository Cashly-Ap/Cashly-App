import { describe, it, expect } from 'vitest';
import { AUTH_SUCCESS_MESSAGES } from '@features/platform/auth/messages/success-messages';

describe('AUTH_SUCCESS_MESSAGES', () => {
  it('should have expected keys', () => {
    const keys = Object.keys(AUTH_SUCCESS_MESSAGES);
    expect(keys).toContain('passwordChanged');
    expect(keys).toContain('usernameChanged');
    expect(keys).toContain('commissionDeductionChanged');
    expect(keys).toContain('loggedIn');
    expect(keys).toContain('loggedOut');
  });

  it('should have correct structure for each message', () => {
    Object.values(AUTH_SUCCESS_MESSAGES).forEach((msg) => {
      expect(msg).toHaveProperty('severity');
      expect(msg).toHaveProperty('summary');
      expect(msg).toHaveProperty('detail');
    });
  });

  it('should have correct passwordChanged message', () => {
    expect(AUTH_SUCCESS_MESSAGES.passwordChanged.severity).toBe('success');
    expect(AUTH_SUCCESS_MESSAGES.passwordChanged.summary).toBe('Éxito');
    expect(AUTH_SUCCESS_MESSAGES.passwordChanged.detail).toContain('Contraseña');
  });

  it('should have correct usernameChanged message', () => {
    expect(AUTH_SUCCESS_MESSAGES.usernameChanged.severity).toBe('success');
    expect(AUTH_SUCCESS_MESSAGES.usernameChanged.detail).toContain('Nombre de usuario');
  });

  it('should have correct commissionDeductionChanged message', () => {
    expect(AUTH_SUCCESS_MESSAGES.commissionDeductionChanged.severity).toBe('success');
    expect(AUTH_SUCCESS_MESSAGES.commissionDeductionChanged.detail).toContain('Deducible');
  });

  it('should have correct loggedIn message', () => {
    expect(AUTH_SUCCESS_MESSAGES.loggedIn.severity).toBe('success');
    expect(AUTH_SUCCESS_MESSAGES.loggedIn.summary).toBe('Bienvenido');
  });

  it('should have correct loggedOut message', () => {
    expect(AUTH_SUCCESS_MESSAGES.loggedOut.severity).toBe('info');
    expect(AUTH_SUCCESS_MESSAGES.loggedOut.summary).toBe('Sesión cerrada');
  });
});
