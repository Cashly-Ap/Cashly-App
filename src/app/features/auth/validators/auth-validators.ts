import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

export class AuthValidators {
  static readonly email = [Validators.required, Validators.email];

  static readonly password = [
    Validators.required,
    Validators.minLength(8),
    AuthValidators.passwordStrength(),
  ];

  static readonly loginPassword = [Validators.required];

  static readonly refreshToken = [Validators.required];

  static passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);

      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric;

      return !passwordValid
        ? {
            passwordStrength: {
              hasUpperCase,
              hasLowerCase,
              hasNumeric,
            },
          }
        : null;
    };
  }

  static getPasswordErrorMessage(errors: ValidationErrors | null): string {
    if (!errors) {
      return '';
    }

    if (errors['required']) {
      return 'Password is required';
    }

    if (errors['minlength']) {
      return `Password must be at least ${errors['minlength'].requiredLength} characters`;
    }

    if (errors['passwordStrength']) {
      const strength = errors['passwordStrength'];
      const missing: string[] = [];

      if (!strength.hasUpperCase) {
        missing.push('uppercase letter');
      }
      if (!strength.hasLowerCase) {
        missing.push('lowercase letter');
      }
      if (!strength.hasNumeric) {
        missing.push('number');
      }

      return `Password must contain: ${missing.join(', ')}`;
    }

    return 'Invalid password';
  }

  static getEmailErrorMessage(errors: ValidationErrors | null): string {
    if (!errors) {
      return '';
    }

    if (errors['required']) {
      return 'Email is required';
    }

    if (errors['email']) {
      return 'Invalid email format';
    }

    return 'Invalid email';
  }
}
