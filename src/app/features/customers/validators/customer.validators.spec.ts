import { describe, it, expect } from 'vitest';
import { FormControl } from '@angular/forms';
import { CustomerValidators } from './customer.validators';

describe('CustomerValidators', () => {
  describe('rif()', () => {
    it('should return null for empty value', () => {
      const control = new FormControl('');
      expect(CustomerValidators.rif()(control)).toBeNull();
    });

    it('should return null for null value', () => {
      const control = new FormControl(null);
      expect(CustomerValidators.rif()(control)).toBeNull();
    });

    it('should return rifBlank for whitespace only', () => {
      const control = new FormControl('   ');
      expect(CustomerValidators.rif()(control)).toEqual({
        rifBlank: { message: 'El RIF no puede estar vacío' },
      });
    });

    it('should return rifInvalidFormat when exceeds 20 characters', () => {
      const control = new FormControl('J-12345678-9-EXTRA-LONG');
      expect(CustomerValidators.rif()(control)).toEqual({
        rifInvalidFormat: { message: 'Formato de RIF inválido. Ejemplo: J-12345678-9' },
      });
    });

    it('should return null for valid RIF', () => {
      const control = new FormControl('J-12345678-9');
      expect(CustomerValidators.rif()(control)).toBeNull();
    });

    it('should return null for V type RIF', () => {
      const control = new FormControl('V-12345678-1');
      expect(CustomerValidators.rif()(control)).toBeNull();
    });
  });

  describe('legalName()', () => {
    it('should return null for empty value', () => {
      const control = new FormControl('');
      expect(CustomerValidators.legalName()(control)).toBeNull();
    });

    it('should return legalNameBlank for whitespace only', () => {
      const control = new FormControl('   ');
      expect(CustomerValidators.legalName()(control)).toEqual({
        legalNameBlank: { message: 'La razón social no puede estar vacía' },
      });
    });

    it('should return legalNameMinLength for single character', () => {
      const control = new FormControl('A');
      expect(CustomerValidators.legalName()(control)).toEqual({
        legalNameMinLength: {
          message: 'La razón social debe tener al menos 2 caracteres',
          minLength: 2,
        },
      });
    });

    it('should return legalNameMaxLength when exceeds 300 characters', () => {
      const control = new FormControl('A'.repeat(301));
      expect(CustomerValidators.legalName()(control)).toEqual({
        legalNameMaxLength: {
          message: 'La razón social no puede exceder 300 caracteres',
          maxLength: 300,
        },
      });
    });

    it('should return legalNameInvalidCharacters for invalid chars', () => {
      const control = new FormControl('Empresa@#$');
      expect(CustomerValidators.legalName()(control)).toEqual({
        legalNameInvalidCharacters: { message: 'La razón social contiene caracteres inválidos' },
      });
    });

    it('should return null for valid legal name', () => {
      const control = new FormControl('Acme Corporation C.A.');
      expect(CustomerValidators.legalName()(control)).toBeNull();
    });
  });

  describe('customerAlias()', () => {
    it('should return null for empty value', () => {
      const control = new FormControl('');
      expect(CustomerValidators.customerAlias()(control)).toBeNull();
    });

    it('should return aliasBlank for whitespace only', () => {
      const control = new FormControl('   ');
      expect(CustomerValidators.customerAlias()(control)).toEqual({
        aliasBlank: { message: 'El alias no puede estar vacío' },
      });
    });

    it('should return aliasMaxLength when exceeds 200 characters', () => {
      const control = new FormControl('A'.repeat(201));
      expect(CustomerValidators.customerAlias()(control)).toEqual({
        aliasMaxLength: { message: 'El alias no puede exceder 200 caracteres', maxLength: 200 },
      });
    });

    it('should return null for valid alias', () => {
      const control = new FormControl('ACME Corp');
      expect(CustomerValidators.customerAlias()(control)).toBeNull();
    });
  });

  describe('email()', () => {
    it('should return null for empty value', () => {
      const control = new FormControl('');
      expect(CustomerValidators.email()(control)).toBeNull();
    });

    it('should return emailBlank for whitespace only', () => {
      const control = new FormControl('   ');
      expect(CustomerValidators.email()(control)).toEqual({
        emailBlank: { message: 'El email no puede estar vacío' },
      });
    });

    it('should return emailInvalidFormat for invalid email', () => {
      const control = new FormControl('not-an-email');
      expect(CustomerValidators.email()(control)).toEqual({
        emailInvalidFormat: { message: 'Formato de email inválido' },
      });
    });

    it('should return null for valid email', () => {
      const control = new FormControl('test@example.com');
      expect(CustomerValidators.email()(control)).toBeNull();
    });

    it('should return emailMaxLength when exceeds 255 characters', () => {
      const control = new FormControl(`${'a'.repeat(250)}@b.com`);
      expect(CustomerValidators.email()(control)).toEqual({
        emailMaxLength: {
          message: 'El email es demasiado largo (máximo 255 caracteres)',
          maxLength: 255,
        },
      });
    });
  });

  describe('phoneNumber()', () => {
    it('should return null for empty value', () => {
      const control = new FormControl('');
      expect(CustomerValidators.phoneNumber()(control)).toBeNull();
    });

    it('should return phoneBlank for whitespace only', () => {
      const control = new FormControl('   ');
      expect(CustomerValidators.phoneNumber()(control)).toEqual({
        phoneBlank: { message: 'El teléfono no puede estar vacío' },
      });
    });

    it('should return phoneMaxLength when exceeds 20 characters', () => {
      const control = new FormControl('0414123456789012345678');
      expect(CustomerValidators.phoneNumber()(control)).toEqual({
        phoneMaxLength: { message: 'El teléfono no puede exceder 20 caracteres', maxLength: 20 },
      });
    });

    it('should return null for valid phone', () => {
      const control = new FormControl('0414-1234567');
      expect(CustomerValidators.phoneNumber()(control)).toBeNull();
    });
  });

  describe('address()', () => {
    it('should return null for empty value', () => {
      const control = new FormControl('');
      expect(CustomerValidators.address()(control)).toBeNull();
    });

    it('should return addressBlank for whitespace only', () => {
      const control = new FormControl('   ');
      expect(CustomerValidators.address()(control)).toEqual({
        addressBlank: { message: 'La dirección no puede estar vacía' },
      });
    });

    it('should return addressMaxLength when exceeds 500 characters', () => {
      const control = new FormControl('A'.repeat(501));
      expect(CustomerValidators.address()(control)).toEqual({
        addressMaxLength: {
          message: 'La dirección no puede exceder 500 caracteres',
          maxLength: 500,
        },
      });
    });

    it('should return null for valid address', () => {
      const control = new FormControl('Av. Principal, Edificio Acme, Piso 5');
      expect(CustomerValidators.address()(control)).toBeNull();
    });
  });

  describe('creditDays()', () => {
    it('should return null for null value', () => {
      const control = new FormControl(null);
      expect(CustomerValidators.creditDays()(control)).toBeNull();
    });

    it('should return creditDaysNegative for negative value', () => {
      const control = new FormControl(-1);
      expect(CustomerValidators.creditDays()(control)).toEqual({
        creditDaysNegative: { message: 'Los días de crédito no pueden ser negativos' },
      });
    });

    it('should return creditDaysMax when exceeds 365', () => {
      const control = new FormControl(366);
      expect(CustomerValidators.creditDays()(control)).toEqual({
        creditDaysMax: { message: 'Los días de crédito no pueden exceder 365 días', max: 365 },
      });
    });

    it('should return null for zero', () => {
      const control = new FormControl(0);
      expect(CustomerValidators.creditDays()(control)).toBeNull();
    });

    it('should return null for valid days', () => {
      const control = new FormControl(30);
      expect(CustomerValidators.creditDays()(control)).toBeNull();
    });

    it('should return null for 365', () => {
      const control = new FormControl(365);
      expect(CustomerValidators.creditDays()(control)).toBeNull();
    });
  });

  describe('creditLimit()', () => {
    it('should return null for null value', () => {
      const control = new FormControl(null);
      expect(CustomerValidators.creditLimit()(control)).toBeNull();
    });

    it('should return creditLimitNegative for negative value', () => {
      const control = new FormControl(-1);
      expect(CustomerValidators.creditLimit()(control)).toEqual({
        creditLimitNegative: { message: 'El límite de crédito no puede ser negativo' },
      });
    });

    it('should return null for zero', () => {
      const control = new FormControl(0);
      expect(CustomerValidators.creditLimit()(control)).toBeNull();
    });

    it('should return null for positive value', () => {
      const control = new FormControl(50000);
      expect(CustomerValidators.creditLimit()(control)).toBeNull();
    });
  });
});
