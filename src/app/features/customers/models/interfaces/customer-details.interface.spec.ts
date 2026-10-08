import { describe, it, expect } from 'vitest';
import type {
  CustomerEmail,
  CustomerPhone,
  CustomerAddress,
  CustomerDetails,
} from '@features/customers/models/interfaces/customer-details.interface';
import { CustomerType } from '@features/customers/models/enums/customer-type.enum';

describe('CustomerEmail interface', () => {
  it('should have all required properties', () => {
    const email: CustomerEmail = {
      id: 'email-001',
      customerId: 'cust-001',
      email: 'test@example.com',
    };

    expect(email.id).toBe('email-001');
    expect(email.customerId).toBe('cust-001');
    expect(email.email).toBe('test@example.com');
  });
});

describe('CustomerPhone interface', () => {
  it('should have all required properties', () => {
    const phone: CustomerPhone = {
      id: 'phone-001',
      customerId: 'cust-001',
      phone: '+58 412-1234567',
    };

    expect(phone.id).toBe('phone-001');
    expect(phone.customerId).toBe('cust-001');
    expect(phone.phone).toBe('+58 412-1234567');
  });
});

describe('CustomerAddress interface', () => {
  it('should have all required properties', () => {
    const address: CustomerAddress = {
      id: 'addr-001',
      customerId: 'cust-001',
      address: 'Av. Principal, Edif. Torre, Piso 1',
      billing: true,
      active: true,
    };

    expect(address.id).toBe('addr-001');
    expect(address.customerId).toBe('cust-001');
    expect(address.address).toBe('Av. Principal, Edif. Torre, Piso 1');
    expect(address.billing).toBe(true);
    expect(address.active).toBe(true);
  });

  it('should allow optional geo fields', () => {
    const address: CustomerAddress = {
      id: 'addr-001',
      customerId: 'cust-001',
      address: 'Av. Principal',
      billing: false,
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

describe('CustomerDetails interface', () => {
  it('should have all required properties', () => {
    const customer: CustomerDetails = {
      id: 'cust-001',
      code: 1001,
      legalName: 'Test Customer C.A.',
      type: CustomerType.BUSINESS,
      rif: 'J-12345678-9',
      alias: 'Test Customer',
      creditDays: 30,
      creditLimit: 10000,
      active: true,
      createdAt: '2025-01-01T00:00:00Z',
      emails: [],
      phones: [],
      addresses: [],
    };

    expect(customer.id).toBe('cust-001');
    expect(customer.code).toBe(1001);
    expect(customer.legalName).toBe('Test Customer C.A.');
    expect(customer.type).toBe(CustomerType.BUSINESS);
    expect(customer.rif).toBe('J-12345678-9');
    expect(customer.alias).toBe('Test Customer');
    expect(customer.creditDays).toBe(30);
    expect(customer.creditLimit).toBe(10000);
    expect(customer.active).toBe(true);
    expect(customer.createdAt).toBe('2025-01-01T00:00:00Z');
    expect(customer.emails).toEqual([]);
    expect(customer.phones).toEqual([]);
    expect(customer.addresses).toEqual([]);
  });

  it('should allow optional notes and priceTypeId', () => {
    const customer: CustomerDetails = {
      id: 'cust-001',
      code: 1001,
      legalName: 'Test Customer',
      type: CustomerType.INDIVIDUAL,
      rif: 'V-12345678-9',
      alias: 'Test',
      creditDays: 0,
      creditLimit: 0,
      active: true,
      createdAt: '2025-01-01T00:00:00Z',
      emails: [],
      phones: [],
      addresses: [],
      notes: 'Important customer',
      priceTypeId: 'pt-001',
    };

    expect(customer.notes).toBe('Important customer');
    expect(customer.priceTypeId).toBe('pt-001');
  });
});
