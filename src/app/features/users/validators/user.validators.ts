import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class UserValidators {
  static passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const password = control.value;
      const errors: string[] = [];

      if (password.length < 8) {
        errors.push('Al menos 8 caracteres');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('Una mayúscula');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('Una minúscula');
      }
      if (!/\d/.test(password)) {
        errors.push('Un número');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Un carácter especial');
      }

      return errors.length > 0 ? { weakPassword: errors } : null;
    };
  }

  static displayNameFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      if (control.value.length < 3 || control.value.length > 100) {
        return { invalidDisplayName: 'El nombre debe tener entre 3 y 100 caracteres' };
      }

      return null;
    };
  }

  static getPasswordErrorMessage(errors: ValidationErrors | null): string {
    if (!errors || !('weakPassword' in errors)) return '';

    const errorMessages = errors['weakPassword'] as string[];
    return `La contraseña debe tener: ${errorMessages.join(', ')}`;
  }
}
