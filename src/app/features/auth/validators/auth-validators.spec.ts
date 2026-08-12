import { FormControl } from '@angular/forms';
import { AuthValidators } from '@features/auth/validators/auth-validators';

describe('AuthValidators', () => {
  describe('email validation', () => {
    it('should validate required email', () => {
      const control = new FormControl('');
      const validators = AuthValidators.email;

      const errors = validators.map((v) => v(control)).filter((e) => e !== null);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toHaveProperty('required');
    });

    it('should validate invalid email format', () => {
      const control = new FormControl('invalid-email');
      const validators = AuthValidators.email;

      const emailValidator = validators.find((v) => v.toString().includes('email'));
      const error = emailValidator ? emailValidator(control) : null;

      expect(error).toHaveProperty('email');
    });

    it('should accept valid email', () => {
      const control = new FormControl('test@example.com');
      const validators = AuthValidators.email;

      const errors = validators.map((v) => v(control)).filter((e) => e !== null);

      expect(errors.length).toBe(0);
    });
  });

  describe('password validation', () => {
    it('should validate required password', () => {
      const control = new FormControl('');
      const validators = AuthValidators.password;

      const errors = validators.map((v) => v(control)).filter((e) => e !== null);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate minimum length', () => {
      const control = new FormControl('Short1!');
      const validators = AuthValidators.password;

      const minLengthValidator = validators.find((v) => v.toString().includes('minLength'));
      const error = minLengthValidator ? minLengthValidator(control) : null;

      expect(error).toHaveProperty('minlength');
    });

    it('should validate password without uppercase', () => {
      const control = new FormControl('password123!');
      const strengthValidator = AuthValidators.passwordStrength();
      const error = strengthValidator(control);

      expect(error).not.toBeNull();
      expect(error?.['passwordStrength'].hasUpperCase).toBe(false);
    });

    it('should validate password without lowercase', () => {
      const control = new FormControl('PASSWORD123!');
      const strengthValidator = AuthValidators.passwordStrength();
      const error = strengthValidator(control);

      expect(error).not.toBeNull();
      expect(error?.['passwordStrength'].hasLowerCase).toBe(false);
    });

    it('should validate password without number', () => {
      const control = new FormControl('Password!');
      const strengthValidator = AuthValidators.passwordStrength();
      const error = strengthValidator(control);

      expect(error).not.toBeNull();
      expect(error?.['passwordStrength'].hasNumeric).toBe(false);
    });

    it('should accept valid strong password', () => {
      const control = new FormControl('Password123');
      const validators = AuthValidators.password;

      const errors = validators.map((v) => v(control)).filter((e) => e !== null);

      expect(errors.length).toBe(0);
    });
  });

  describe('loginPassword validation', () => {
    it('should only validate required', () => {
      const control = new FormControl('');
      const validators = AuthValidators.loginPassword;

      const errors = validators.map((v) => v(control)).filter((e) => e !== null);

      expect(errors.length).toBe(1);
      expect(errors[0]).toHaveProperty('required');
    });

    it('should accept any non-empty password for login', () => {
      const control = new FormControl('weak');
      const validators = AuthValidators.loginPassword;

      const errors = validators.map((v) => v(control)).filter((e) => e !== null);

      expect(errors.length).toBe(0);
    });
  });

  describe('error messages', () => {
    it('should return correct email error message for required', () => {
      const message = AuthValidators.getEmailErrorMessage({ required: true });
      expect(message).toBe('Email is required');
    });

    it('should return correct email error message for invalid format', () => {
      const message = AuthValidators.getEmailErrorMessage({ email: true });
      expect(message).toBe('Invalid email format');
    });

    it('should return correct password error message for required', () => {
      const message = AuthValidators.getPasswordErrorMessage({
        required: true,
      });
      expect(message).toBe('La contraseña es requerida');
    });

    it('should return correct password error message for min length', () => {
      const message = AuthValidators.getPasswordErrorMessage({
        minlength: { requiredLength: 8, actualLength: 5 },
      });
      expect(message).toBe('La contraseña debe tener al menos 8 caracteres');
    });

    it('should return correct password error message for missing uppercase', () => {
      const message = AuthValidators.getPasswordErrorMessage({
        passwordStrength: {
          hasUpperCase: false,
          hasLowerCase: true,
          hasNumeric: true,
        },
      });
      expect(message).toContain('letra mayúscula');
    });

    it('should return correct password error message for multiple missing requirements', () => {
      const message = AuthValidators.getPasswordErrorMessage({
        passwordStrength: {
          hasUpperCase: false,
          hasLowerCase: false,
          hasNumeric: true,
        },
      });
      expect(message).toContain('letra mayúscula');
      expect(message).toContain('letra minúscula');
    });
  });
});
