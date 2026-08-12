import { describe, it, expect } from 'vitest';
import type {
  CustomerEditEmail,
  CustomerEditPhone,
  CustomerEditAddress,
  CustomerEdit,
  CustomerFormData,
} from '@features/customers/models/interfaces/customer-edit.interface';
import { CustomerType } from '@features/customers/models/enums/customer-type.enum';

describe('CustomerEditEmail interface', () => {
  it('should have required email property', () => {
    const email: CustomerEditEmail = {
      email: 'test@example.com',
    };

    expect(email.email).toBe('test@example.com');
  });

  it('should allow optional id and customerId', () => {
    const email: CustomerEditEmail = {
      id: 'email-001',
      customerId: 'cust-001',
      email: 'test@example.com',
    };

    expect(email.id).toBe('email-001');
    expect(email.customerId).toBe('cust-001');
  });
});

describe('CustomerEditPhone interface', () => {
  it('should have required phone property', () => {
    const phone: CustomerEditPhone = {
      phone: '+58 412-1234567',
    };

    expect(phone.phone).toBe('+58 412-1234567');
  });

  it('should allow optional id and customerId', () => {
    const phone: CustomerEditPhone = {
      id: 'phone-001',
      customerId: 'cust-001',
      phone: '+58 412-1234567',
    };

    expect(phone.id).toBe('phone-001');
    expect(phone.customerId).toBe('cust-001');
  });
});

describe('CustomerEditAddress interface', () => {
  it('should have all required properties', () => {
    const address: CustomerEditAddress = {
      address: 'Av. Principal',
      billing: true,
      active: true,
    };

    expect(address.address).toBe('Av. Principal');
    expect(address.billing).toBe(true);
    expect(address.active).toBe(true);
  });

  it('should allow optional fields', () => {
    const address: CustomerEditAddress = {
      id: 'addr-001',
      customerId: 'cust-001',
      address: 'Av. Principal',
      billing: true,
      active: true,
      state: 'Zulia',
      municipality: 'Maracaibo',
      postalCode: '4002',
    };

    expect(address.id).toBe('addr-001');
    expect(address.customerId).toBe('cust-001');
    expect(address.state).toBe('Zulia');
  });
});

describe('CustomerEdit interface', () => {
  it('should have all required properties', () => {
    const customer: CustomerEdit = {
      id: 'cust-001',
      legalName: 'Test Customer C.A.',
      type: CustomerType.BUSINESS,
      rif: 'J-12345678-9',
      alias: 'Test Customer',
      creditDays: 30,
      creditLimit: 10000,
      active: true,
      emails: [],
      phones: [],
      addresses: [],
    };

    expect(customer.id).toBe('cust-001');
    expect(customer.legalName).toBe('Test Customer C.A.');
    expect(customer.type).toBe(CustomerType.BUSINESS);
    expect(customer.rif).toBe('J-12345678-9');
    expect(customer.alias).toBe('Test Customer');
    expect(customer.creditDays).toBe(30);
    expect(customer.creditLimit).toBe(10000);
    expect(customer.active).toBe(true);
  });

  it('should allow optional fields', () => {
    const customer: CustomerEdit = {
      id: 'cust-001',
      legalName: 'Test Customer',
      type: CustomerType.INDIVIDUAL,
      rif: 'V-12345678-9',
      alias: 'Test',
      creditDays: 0,
      creditLimit: 0,
      active: true,
      portalAccess: true,
      emails: [],
      phones: [],
      addresses: [],
      notes: 'Updated notes',
      priceTypeId: 'pt-001',
    };

    expect(customer.portalAccess).toBe(true);
    expect(customer.notes).toBe('Updated notes');
    expect(customer.priceTypeId).toBe('pt-001');
  });
});

describe('CustomerFormData interface', () => {
  it('should have all required properties', () => {
    const formData: CustomerFormData = {
      legalName: 'Test Customer',
      type: CustomerType.BUSINESS,
      rif: 'J-12345678-9',
      alias: 'Test',
      creditDays: 30,
      creditLimit: 10000,
    };

    expect(formData.legalName).toBe('Test Customer');
    expect(formData.type).toBe(CustomerType.BUSINESS);
    expect(formData.rif).toBe('J-12345678-9');
    expect(formData.alias).toBe('Test');
    expect(formData.creditDays).toBe(30);
    expect(formData.creditLimit).toBe(10000);
  });

  it('should allow all optional properties', () => {
    const formData: CustomerFormData = {
      id: 'cust-001',
      code: 1001,
      legalName: 'Test Customer',
      type: CustomerType.INDIVIDUAL,
      rif: 'V-12345678-9',
      alias: 'Test',
      creditDays: 0,
      creditLimit: 0,
      active: true,
      portalAccess: false,
      emails: [{ email: 'test@example.com' }],
      phones: [{ phone: '+58 412-1234567' }],
      addresses: [{ address: 'Av. Principal', billing: true, active: true }],
      notes: 'Form data notes',
      priceTypeId: 'pt-001',
    };

    expect(formData.id).toBe('cust-001');
    expect(formData.code).toBe(1001);
    expect(formData.active).toBe(true);
    expect(formData.portalAccess).toBe(false);
    expect(formData.emails).toHaveLength(1);
    expect(formData.phones).toHaveLength(1);
    expect(formData.addresses).toHaveLength(1);
    expect(formData.notes).toBe('Form data notes');
    expect(formData.priceTypeId).toBe('pt-001');
  });
});
