import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FormArray } from '@angular/forms';

export class CustomerValidators {
  static rif(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const trimmed = value.trim();
      if (trimmed.length === 0) return { rifBlank: { message: 'El RIF no puede estar vacío' } };

      const rifPattern = /^[JVGEPjvgep]-\d{8}-\d$/;
      if (!rifPattern.test(trimmed)) {
        return { rifInvalidFormat: { message: 'Formato de RIF inválido. Ejemplo: J-12345678-9' } };
      }

      return null;
    };
  }

  static legalName(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const trimmed = value.trim();
      if (trimmed.length === 0) return { legalNameBlank: { message: 'La razón social no puede estar vacía' } };
      if (trimmed.length < 2) return { legalNameMinLength: { message: 'La razón social debe tener al menos 2 caracteres', minLength: 2 } };
      if (trimmed.length > 300) return { legalNameMaxLength: { message: 'La razón social no puede exceder 300 caracteres', maxLength: 300 } };

      const validPattern = /^[a-zA-ZÀ-ÿ0-9\s.,&'-]+$/;
      if (!validPattern.test(trimmed)) return { legalNameInvalidCharacters: { message: 'La razón social contiene caracteres inválidos' } };

      return null;
    };
  }

  static customerAlias(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const trimmed = value.trim();
      if (trimmed.length === 0) return { aliasBlank: { message: 'El alias no puede estar vacío' } };
      if (trimmed.length > 200) return { aliasMaxLength: { message: 'El alias no puede exceder 200 caracteres', maxLength: 200 } };

      return null;
    };
  }

  static email(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const trimmed = value.trim();
      if (trimmed.length === 0) return { emailBlank: { message: 'El email no puede estar vacío' } };
      if (trimmed.length > 255) return { emailMaxLength: { message: 'El email es demasiado largo (máximo 255 caracteres)', maxLength: 255 } };

      const emailPattern = /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/;
      if (!emailPattern.test(trimmed)) return { emailInvalidFormat: { message: 'Formato de email inválido' } };

      return null;
    };
  }

  static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const trimmed = value.trim();
      if (trimmed.length === 0) return { phoneBlank: { message: 'El teléfono no puede estar vacío' } };
      if (trimmed.length > 20) return { phoneMaxLength: { message: 'El teléfono no puede exceder 20 caracteres', maxLength: 20 } };

      return null;
    };
  }

  static address(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const trimmed = value.trim();
      if (trimmed.length === 0) return { addressBlank: { message: 'La dirección no puede estar vacía' } };
      if (trimmed.length > 500) return { addressMaxLength: { message: 'La dirección no puede exceder 500 caracteres', maxLength: 500 } };

      return null;
    };
  }

  static minLengthArray(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const array = control as FormArray;
      if (array.length < min) {
        return { minLengthArray: { message: `Se requiere al menos ${min} elemento(s)`, min, actual: array.length } };
      }
      return null;
    };
  }

  static creditDays(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined) return null;
      if (value < 0) return { creditDaysNegative: { message: 'Los días de crédito no pueden ser negativos' } };
      if (value > 365) return { creditDaysMax: { message: 'Los días de crédito no pueden exceder 365 días', max: 365 } };

      return null;
    };
  }

  static creditLimit(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined) return null;
      if (value < 0) return { creditLimitNegative: { message: 'El límite de crédito no puede ser negativo' } };

      return null;
    };
  }
}
