import { FormArray, FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { SupplierValidators } from '@features/partners/suppliers/validators/supplier.validators';

describe('SupplierValidators', () => {
  it('accepts empty optional values and validates RIF format', () => {
    expect(SupplierValidators.rif()(new FormControl(''))).toBeNull();
    expect(SupplierValidators.rif()(new FormControl(' J-12345678-9 '))).toBeNull();
    expect(SupplierValidators.rif()(new FormControl('invalid'))).toHaveProperty('rifInvalidFormat');
    expect(SupplierValidators.rif()(new FormControl('   '))).toHaveProperty('rifBlank');
  });

  it('validates supplier legal names and aliases', () => {
    expect(SupplierValidators.legalName()(new FormControl('Acme S.A.'))).toBeNull();
    expect(SupplierValidators.legalName()(new FormControl(' '))).toHaveProperty('legalNameBlank');
    expect(SupplierValidators.legalName()(new FormControl('A'))).toHaveProperty(
      'legalNameMinLength',
    );
    expect(SupplierValidators.legalName()(new FormControl('x'.repeat(301)))).toHaveProperty(
      'legalNameMaxLength',
    );
    expect(SupplierValidators.legalName()(new FormControl('Acme 😀'))).toHaveProperty(
      'legalNameInvalidCharacters',
    );
    expect(SupplierValidators.supplierAlias()(new FormControl(''))).toBeNull();
    expect(SupplierValidators.supplierAlias()(new FormControl(' '))).toHaveProperty('aliasBlank');
    expect(SupplierValidators.supplierAlias()(new FormControl('x'.repeat(201)))).toHaveProperty(
      'aliasMaxLength',
    );
  });

  it('validates email, phone, and address values and their length limits', () => {
    expect(SupplierValidators.email()(new FormControl('supplier@example.com'))).toBeNull();
    expect(SupplierValidators.email()(new FormControl(' '))).toHaveProperty('emailBlank');
    expect(SupplierValidators.email()(new FormControl('invalid'))).toHaveProperty(
      'emailInvalidFormat',
    );
    expect(SupplierValidators.email()(new FormControl('x'.repeat(256)))).toHaveProperty(
      'emailMaxLength',
    );
    expect(SupplierValidators.phoneNumber()(new FormControl('+1 555-0100'))).toBeNull();
    expect(SupplierValidators.phoneNumber()(new FormControl(' '))).toHaveProperty('phoneBlank');
    expect(SupplierValidators.phoneNumber()(new FormControl('x'.repeat(21)))).toHaveProperty(
      'phoneMaxLength',
    );
    expect(SupplierValidators.address()(new FormControl('Main Street'))).toBeNull();
    expect(SupplierValidators.address()(new FormControl(' '))).toHaveProperty('addressBlank');
    expect(SupplierValidators.address()(new FormControl('x'.repeat(501)))).toHaveProperty(
      'addressMaxLength',
    );
  });

  it('requires a configurable minimum number of array items', () => {
    const validator = SupplierValidators.minLengthArray(2);
    expect(validator(new FormArray([new FormControl('one')]))).toMatchObject({
      minLengthArray: { min: 2, actual: 1 },
    });
    expect(validator(new FormArray([new FormControl('one'), new FormControl('two')]))).toBeNull();
  });
});
