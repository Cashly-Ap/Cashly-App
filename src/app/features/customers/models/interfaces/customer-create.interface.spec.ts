import { describe, it, expect } from 'vitest';
import type {
  CustomerCreateEmail,
  CustomerCreatePhone,
  CustomerCreateAddress,
  CustomerCreate,
} from './customer-create.interface';
import { CustomerType } from '@features/customers/models/enums/customer-type.enum';

describe('CustomerCreateEmail interface', () => {
  it('should have all required properties', () => {
    const email: CustomerCreateEmail = {
      email: 'test@example.com',
    };

    expect(email.email).toBe('test@example.com');
  });
});

describe('CustomerCreatePhone interface', () => {
  it('should have all required properties', () => {
    const phone: CustomerCreatePhone = {
      phone: '+58 412-1234567',
    };

    expect(phone.phone).toBe('+58 412-1234567');
  });
});

describe('CustomerCreateAddress interface', () => {
  it('should have all required properties', () => {
    const address: CustomerCreateAddress = {
      address: 'Av. Principal',
      billing: true,
      active: true,
    };

    expect(address.address).toBe('Av. Principal');
    expect(address.billing).toBe(true);
    expect(address.active).toBe(true);
  });

  it('should allow optional geo fields', () => {
    const address: CustomerCreateAddress = {
      address: 'Av. Principal',
      billing: true,
      active: true,
      state: 'Zulia',
      municipality: 'Maracaibo',
      postalCode: '4002',
    };

    expect(address.state).toBe('Zulia');
    expect(address.municipality).toBe('Maracaibo');
    expect(address.postalCode).toBe('4002');
  });
});

describe('CustomerCreate interface', () => {
  it('should have all required properties', () => {
    const customer: CustomerCreate = {
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

    expect(customer.legalName).toBe('Test Customer C.A.');
    expect(customer.type).toBe(CustomerType.BUSINESS);
    expect(customer.rif).toBe('J-12345678-9');
    expect(customer.alias).toBe('Test Customer');
    expect(customer.creditDays).toBe(30);
    expect(customer.creditLimit).toBe(10000);
    expect(customer.active).toBe(true);
    expect(customer.emails).toEqual([]);
    expect(customer.phones).toEqual([]);
    expect(customer.addresses).toEqual([]);
  });

  it('should allow optional fields', () => {
    const customer: CustomerCreate = {
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
      notes: 'New customer',
      priceTypeId: 'pt-001',
    };

    expect(customer.portalAccess).toBe(true);
    expect(customer.notes).toBe('New customer');
    expect(customer.priceTypeId).toBe('pt-001');
  });
});
