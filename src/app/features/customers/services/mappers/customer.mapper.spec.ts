import { describe, it, expect, beforeEach } from 'vitest';
import { CustomerMapper } from '@features/customers/services/mappers/customer.mapper';
import { CustomerType } from '@features/customers/models/enums';
import { CustomerDetails } from '@features/customers/models/interfaces';

describe('CustomerMapper', () => {
  let mapper: CustomerMapper;

  const mockDetails: CustomerDetails = {
    id: 'uuid-001',
    code: 1001,
    legalName: 'Acme Corporation C.A.',
    type: CustomerType.BUSINESS,
    rif: 'J-12345678-9',
    alias: 'ACME Corp',
    creditDays: 30,
    creditLimit: 50000,
    active: true,
    deletable: true,
    createdAt: '2025-01-15T10:30:00Z',
    emails: [
      { id: 'email-001', customerId: 'uuid-001', email: 'contact@acme.com' },
      { id: 'email-002', customerId: 'uuid-001', email: 'sales@acme.com' },
    ],
    phones: [{ id: 'phone-001', customerId: 'uuid-001', phone: '0212-1234567' }],
    addresses: [
      {
        id: 'addr-001',
        customerId: 'uuid-001',
        address: 'Av. Principal, Edificio Acme',
        billing: true,
        active: true,
      },
    ],
  };

  beforeEach(() => {
    mapper = new CustomerMapper();
  });

  describe('toList()', () => {
    it('should map CustomerDetails to CustomerList', () => {
      const result = mapper.toList(mockDetails);

      expect(result).toEqual({
        id: 'uuid-001',
        code: 1001,
        alias: 'ACME Corp',
        legalName: 'Acme Corporation C.A.',
        rif: 'J-12345678-9',
        type: CustomerType.BUSINESS,
        active: true,
        deletable: true,
      });
    });
  });

  describe('toFormModel()', () => {
    it('should map CustomerDetails to CustomerFormModel', () => {
      const result = mapper.toFormModel(mockDetails);

      expect(result.id).toBe('uuid-001');
      expect(result.code).toBe(1001);
      expect(result.legalName).toBe('Acme Corporation C.A.');
      expect(result.type).toBe(CustomerType.BUSINESS);
      expect(result.rif).toBe('J-12345678-9');
      expect(result.alias).toBe('ACME Corp');
      expect(result.creditDays).toBe(30);
      expect(result.creditLimit).toBe(50000);
      expect(result.active).toBe(true);
    });

    it('should map emails correctly', () => {
      const result = mapper.toFormModel(mockDetails);

      expect(result.emails).toHaveLength(2);
      expect(result.emails[0]).toEqual({
        id: 'email-001',
        customerId: 'uuid-001',
        email: 'contact@acme.com',
      });
    });

    it('should map phones correctly', () => {
      const result = mapper.toFormModel(mockDetails);

      expect(result.phones).toHaveLength(1);
      expect(result.phones[0]).toEqual({
        id: 'phone-001',
        customerId: 'uuid-001',
        phone: '0212-1234567',
      });
    });

    it('should map addresses correctly', () => {
      const result = mapper.toFormModel(mockDetails);

      expect(result.addresses).toHaveLength(1);
      expect(result.addresses[0]).toEqual({
        id: 'addr-001',
        customerId: 'uuid-001',
        address: 'Av. Principal, Edificio Acme',
        billing: true,
        active: true,
      });
    });
  });

  describe('toCreateRequest()', () => {
    const warehouseIds = ['wh-001', 'wh-002'];

    it('should map form model to create request', () => {
      const form = mapper.toFormModel(mockDetails);
      const result = mapper.toCreateRequest(form, warehouseIds);

      expect(result.legalName).toBe('Acme Corporation C.A.');
      expect(result.type).toBe(CustomerType.BUSINESS);
      expect(result.rif).toBe('J-12345678-9');
      expect(result.alias).toBe('ACME Corp');
      expect(result.creditDays).toBe(30);
      expect(result.creditLimit).toBe(50000);
      expect(result.active).toBe(true);
    });

    it('should include warehouse ids in create request', () => {
      const form = mapper.toFormModel(mockDetails);
      const result = mapper.toCreateRequest(form, warehouseIds);

      expect(result.warehouseIds).toEqual(['wh-001', 'wh-002']);
    });

    it('should strip ids from emails', () => {
      const form = mapper.toFormModel(mockDetails);
      const result = mapper.toCreateRequest(form, warehouseIds);

      expect(result.emails).toEqual([{ email: 'contact@acme.com' }, { email: 'sales@acme.com' }]);
    });

    it('should strip ids from phones', () => {
      const form = mapper.toFormModel(mockDetails);
      const result = mapper.toCreateRequest(form, warehouseIds);

      expect(result.phones).toEqual([{ phone: '0212-1234567' }]);
    });

    it('should strip ids from addresses', () => {
      const form = mapper.toFormModel(mockDetails);
      const result = mapper.toCreateRequest(form, warehouseIds);

      expect(result.addresses).toEqual([
        { address: 'Av. Principal, Edificio Acme', billing: true, active: true },
      ]);
    });
  });

  describe('toUpdateRequest()', () => {
    it('should map form model to update request with id', () => {
      const form = mapper.toFormModel(mockDetails);
      const result = mapper.toUpdateRequest(form);

      expect(result.id).toBe('uuid-001');
      expect(result.legalName).toBe('Acme Corporation C.A.');
      expect(result.type).toBe(CustomerType.BUSINESS);
    });

    it('should strip ids from nested entities', () => {
      const form = mapper.toFormModel(mockDetails);
      const result = mapper.toUpdateRequest(form);

      expect(result.emails).toEqual([{ email: 'contact@acme.com' }, { email: 'sales@acme.com' }]);
      expect(result.phones).toEqual([{ phone: '0212-1234567' }]);
      expect(result.addresses).toEqual([
        { address: 'Av. Principal, Edificio Acme', billing: true, active: true },
      ]);
    });
  });
});
