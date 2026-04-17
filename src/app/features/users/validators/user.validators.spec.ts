import { FormControl } from '@angular/forms';
import { describe, it, expect } from 'vitest';
import { UserValidators } from './user.validators';

describe('UserValidators', () => {
  describe('passwordStrength', () => {
    it('should return null for empty value', () => {
      const control = new FormControl('');
      const validator = UserValidators.passwordStrength();
      expect(validator(control)).toBeNull();
    });

    it('should return null for null value', () => {
      const control = new FormControl(null);
      const validator = UserValidators.passwordStrength();
      expect(validator(control)).toBeNull();
    });

    it('should return error when password is too short', () => {
      const control = new FormControl('Ab1!');
      const validator = UserValidators.passwordStrength();
      const error = validator(control);
      expect(error).not.toBeNull();
      expect(error?.['weakPassword']).toBeDefined();
    });

    it('should return error when password has no uppercase', () => {
      const control = new FormControl('password1!');
      const validator = UserValidators.passwordStrength();
      const error = validator(control);
      expect(error).not.toBeNull();
      expect(error?.['weakPassword']).toBeDefined();
    });

    it('should return error when password has no lowercase', () => {
      const control = new FormControl('PASSWORD1!');
      const validator = UserValidators.passwordStrength();
      const error = validator(control);
      expect(error).not.toBeNull();
      expect(error?.['weakPassword']).toBeDefined();
    });

    it('should return error when password has no number', () => {
      const control = new FormControl('Password!');
      const validator = UserValidators.passwordStrength();
      const error = validator(control);
      expect(error).not.toBeNull();
      expect(error?.['weakPassword']).toBeDefined();
    });

    it('should return null for strong password', () => {
      const control = new FormControl('Password1');
      const validator = UserValidators.passwordStrength();
      expect(validator(control)).toBeNull();
    });

    it('should return null for password with various characters', () => {
      const control = new FormControl('SecurePassw0rd');
      const validator = UserValidators.passwordStrength();
      expect(validator(control)).toBeNull();
    });
  });

  describe('displayNameFormat', () => {
    it('should return null for empty value', () => {
      const control = new FormControl('');
      const validator = UserValidators.displayNameFormat();
      expect(validator(control)).toBeNull();
    });

    it('should return null for null value', () => {
      const control = new FormControl(null);
      const validator = UserValidators.displayNameFormat();
      expect(validator(control)).toBeNull();
    });

    it('should return error for name shorter than 3 characters', () => {
      const control = new FormControl('AB');
      const validator = UserValidators.displayNameFormat();
      const error = validator(control);
      expect(error).not.toBeNull();
      expect(error?.['invalidDisplayName']).toBeDefined();
    });

    it('should return error for name longer than 100 characters', () => {
      const control = new FormControl('A'.repeat(101));
      const validator = UserValidators.displayNameFormat();
      const error = validator(control);
      expect(error).not.toBeNull();
      expect(error?.['invalidDisplayName']).toBeDefined();
    });

    it('should return null for valid name with 3 characters', () => {
      const control = new FormControl('Ana');
      const validator = UserValidators.displayNameFormat();
      expect(validator(control)).toBeNull();
    });

    it('should return null for valid name with 100 characters', () => {
      const control = new FormControl('A'.repeat(100));
      const validator = UserValidators.displayNameFormat();
      expect(validator(control)).toBeNull();
    });

    it('should return null for a typical user name', () => {
      const control = new FormControl('Juan Pérez García');
      const validator = UserValidators.displayNameFormat();
      expect(validator(control)).toBeNull();
    });
  });

  describe('getPasswordErrorMessage', () => {
    it('should return empty string for null errors', () => {
      expect(UserValidators.getPasswordErrorMessage(null)).toBe('');
    });

    it('should return empty string when no weakPassword error', () => {
      expect(UserValidators.getPasswordErrorMessage({ required: true })).toBe('');
    });

    it('should return formatted message with missing requirements', () => {
      const errors = {
        weakPassword: ['Al menos 8 caracteres', 'Una mayúscula'],
      };
      const message = UserValidators.getPasswordErrorMessage(errors);
      expect(message).toContain('Al menos 8 caracteres');
      expect(message).toContain('Una mayúscula');
    });
  });
});
