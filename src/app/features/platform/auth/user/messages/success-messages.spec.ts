import { describe, it, expect } from 'vitest';
import { USER_SUCCESS_MESSAGES } from '@features/platform/auth/user/messages/success-messages';

describe('USER_SUCCESS_MESSAGES', () => {
  it('should have created, updated, and deleted keys', () => {
    expect(Object.keys(USER_SUCCESS_MESSAGES)).toEqual(['created', 'updated', 'deleted']);
  });

  it('should have correct structure for each message', () => {
    Object.values(USER_SUCCESS_MESSAGES).forEach((msg) => {
      expect(msg).toHaveProperty('summary');
      expect(msg).toHaveProperty('detail');
    });
  });

  it('should have correct created message', () => {
    expect(USER_SUCCESS_MESSAGES.created.summary).toBe('Éxito');
    expect(USER_SUCCESS_MESSAGES.created.detail).toContain('creado');
  });

  it('should have correct updated message', () => {
    expect(USER_SUCCESS_MESSAGES.updated.summary).toBe('Éxito');
    expect(USER_SUCCESS_MESSAGES.updated.detail).toContain('actualizado');
  });

  it('should have correct deleted message', () => {
    expect(USER_SUCCESS_MESSAGES.deleted.summary).toBe('Éxito');
    expect(USER_SUCCESS_MESSAGES.deleted.detail).toContain('eliminado');
  });
});
