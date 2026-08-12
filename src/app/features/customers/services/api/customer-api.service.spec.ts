import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CustomerApiService } from '@features/customers/services/api/customer-api.service';
import { CustomerType } from '@features/customers/models/enums';
import {
  CustomerList,
  CustomerDetails,
  CustomerCreate,
  CustomerEdit,
} from '@features/customers/models/interfaces';

describe('CustomerApiService', () => {
  let service: CustomerApiService;
  let httpMock: HttpTestingController;

  const mockList: CustomerList[] = [
    {
      id: 'uuid-001',
      code: 1001,
      alias: 'ACME',
      legalName: 'Acme C.A.',
      rif: 'J-12345678-9',
      type: CustomerType.BUSINESS,
      active: true,
    },
  ];

  const mockDetails: CustomerDetails = {
    id: 'uuid-001',
    code: 1001,
    legalName: 'Acme C.A.',
    type: CustomerType.BUSINESS,
    rif: 'J-12345678-9',
    alias: 'ACME',
    creditDays: 30,
    creditLimit: 50000,
    active: true,
    createdAt: '2025-01-15T10:30:00Z',
    emails: [{ id: 'e1', customerId: 'uuid-001', email: 'contact@acme.com' }],
    phones: [{ id: 'p1', customerId: 'uuid-001', phone: '0212-1234567' }],
    addresses: [
      { id: 'a1', customerId: 'uuid-001', address: 'Av. Principal', billing: true, active: true },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CustomerApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CustomerApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAll()', () => {
    it('should GET /api/customers and return list', () => {
      service.getAll().subscribe((result) => {
        expect(result).toEqual(mockList);
      });

      const req = httpMock.expectOne('/api/customers');
      expect(req.request.method).toBe('GET');
      req.flush(mockList);
    });
  });

  describe('getById()', () => {
    it('should GET /api/customers/:id and return details', () => {
      service.getById('uuid-001').subscribe((result) => {
        expect(result).toEqual(mockDetails);
      });

      const req = httpMock.expectOne('/api/customers/uuid-001');
      expect(req.request.method).toBe('GET');
      req.flush(mockDetails);
    });
  });

  describe('create()', () => {
    it('should POST /api/customers with data and return details', () => {
      const createData: CustomerCreate = {
        legalName: 'Acme C.A.',
        type: CustomerType.BUSINESS,
        rif: 'J-12345678-9',
        alias: 'ACME',
        creditDays: 30,
        creditLimit: 50000,
        active: true,
        emails: [{ email: 'contact@acme.com' }],
        phones: [{ phone: '0212-1234567' }],
        addresses: [{ address: 'Av. Principal', billing: true, active: true }],
      };

      service.create(createData).subscribe((result) => {
        expect(result).toEqual(mockDetails);
      });

      const req = httpMock.expectOne('/api/customers');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createData);
      req.flush(mockDetails);
    });
  });

  describe('update()', () => {
    it('should PUT /api/customers/:id with data and return details', () => {
      const editData: CustomerEdit = {
        id: 'uuid-001',
        legalName: 'Acme C.A. Updated',
        type: CustomerType.BUSINESS,
        rif: 'J-12345678-9',
        alias: 'ACME Updated',
        creditDays: 45,
        creditLimit: 75000,
        active: true,
        emails: [{ email: 'contact@acme.com' }],
        phones: [{ phone: '0212-1234567' }],
        addresses: [{ address: 'Av. Principal', billing: true, active: true }],
      };

      service.update('uuid-001', editData).subscribe((result) => {
        expect(result).toEqual(mockDetails);
      });

      const req = httpMock.expectOne('/api/customers/uuid-001');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(editData);
      req.flush(mockDetails);
    });
  });

  describe('delete()', () => {
    it('should DELETE /api/customers/:id', () => {
      service.delete('uuid-001').subscribe();

      const req = httpMock.expectOne('/api/customers/uuid-001');
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });
});
