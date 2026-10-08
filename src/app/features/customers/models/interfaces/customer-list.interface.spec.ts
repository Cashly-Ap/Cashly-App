import { describe, it, expect } from 'vitest';
import type { CustomerList } from '@features/customers/models/interfaces/customer-list.interface';
import { CustomerType } from '@features/customers/models/enums/customer-type.enum';

describe('CustomerList interface', () => {
  it('should have all required properties', () => {
    const customer: CustomerList = {
      id: 'cust-001',
      code: 1001,
      alias: 'Test Customer',
      legalName: 'Test Customer C.A.',
      rif: 'J-12345678-9',
      type: CustomerType.BUSINESS,
      active: true,
    };

    expect(customer.id).toBe('cust-001');
    expect(customer.code).toBe(1001);
    expect(customer.alias).toBe('Test Customer');
    expect(customer.legalName).toBe('Test Customer C.A.');
    expect(customer.rif).toBe('J-12345678-9');
    expect(customer.type).toBe(CustomerType.BUSINESS);
    expect(customer.active).toBe(true);
  });

  it('should accept all CustomerType values', () => {
    const types: CustomerType[] = [
      CustomerType.INDIVIDUAL,
      CustomerType.BUSINESS,
      CustomerType.GOVERNMENT,
      CustomerType.NON_PROFIT,
    ];

    types.forEach((type) => {
      const customer: CustomerList = {
        id: 'cust-001',
        code: 1001,
        alias: 'Test',
        legalName: 'Test',
        rif: 'J-12345678-9',
        type,
        active: true,
      };
      expect(customer.type).toBe(type);
    });
  });
});
