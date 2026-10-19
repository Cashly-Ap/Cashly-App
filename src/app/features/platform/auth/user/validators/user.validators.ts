import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class UserValidators {
  static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const normalized = String(control.value).replace(/[\s().-]/g, '');
      return /^\+?\d{7,15}$/.test(normalized) ? null : { invalidPhone: true };
    };
  }

  static passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const password = control.value;
      const errors: string[] = [];

      if (password.length < 8) {
        errors.push('at least 8 characters');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('one uppercase letter');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('one lowercase letter');
      }
      if (!/\d/.test(password)) {
        errors.push('one number');
      }

      return errors.length > 0 ? { weakPassword: errors } : null;
    };
  }

  static displayNameFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      if (control.value.length < 3 || control.value.length > 100) {
        return { invalidDisplayName: 'Name must be between 3 and 100 characters' };
      }

      return null;
    };
  }

  static getPasswordErrorMessage(errors: ValidationErrors | null): string {
    if (!errors || !('weakPassword' in errors)) return '';

    const errorMessages = errors['weakPassword'] as string[];
    return `Password must contain: ${errorMessages.join(', ')}`;
  }
}
