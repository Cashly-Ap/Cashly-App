import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CustomerApplicationService } from '@features/partners/customers/services/application/customer-application.service';
import { CustomerApiService } from '@features/partners/customers/services/api/customer-api.service';
import { CustomerMapper } from '@features/partners/customers/services/mappers/customer.mapper';
import { CustomerType } from '@features/partners/customers/models/enums/customer-type.enum';
import { CustomerList } from '@features/partners/customers/models/interfaces/customer-list.interface';
import { CustomerDetails } from '@features/partners/customers/models/interfaces/customer-details.interface';
import { CustomerCreate } from '@features/partners/customers/models/interfaces/customer-create.interface';
import { CustomerEdit } from '@features/partners/customers/models/interfaces/customer-edit.interface';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

describe('CustomerApplicationService', () => {
  let service: CustomerApplicationService;
  let mockApiService: {
    getAll: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

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

  const mockListItem: CustomerList = {
    id: 'uuid-001',
    code: 1001,
    alias: 'ACME',
    legalName: 'Acme C.A.',
    rif: 'J-12345678-9',
    type: CustomerType.BUSINESS,
    active: true,
  };

  const mockPagedResponse = (items: CustomerList[]): PagedResponse<CustomerList> => ({
    content: items,
    totalElements: items.length,
    totalPages: 1,
    size: 20,
    number: 0,
  });

  beforeEach(() => {
    mockApiService = {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        CustomerApplicationService,
        CustomerMapper,
        { provide: CustomerApiService, useValue: mockApiService },
      ],
    });

    service = TestBed.inject(CustomerApplicationService);
  });

  describe('initial state', () => {
    it('should have empty customers array initially', () => {
      expect(service.customers()).toEqual([]);
    });

    it('should have null currentCustomer initially', () => {
      expect(service.currentCustomer()).toBeNull();
    });

    it('should not be loading initially', () => {
      expect(service.loading()).toBe(false);
    });

    it('should have null error initially', () => {
      expect(service.error()).toBeNull();
    });
  });

  describe('loadAll()', () => {
    it('should load customers and update signal', () => {
      mockApiService.getAll.mockReturnValue(of(mockPagedResponse([mockListItem])));

      service.loadAll().subscribe(() => {
        expect(service.customers()).toHaveLength(1);
        expect(service.customers()[0].id).toBe('uuid-001');
      });

      expect(service.loading()).toBe(false);
    });

    it('should set error on failure', () => {
      mockApiService.getAll.mockReturnValue(throwError(() => new Error('Network error')));

      service.loadAll().subscribe({
        error: () => {
          expect(service.error()).toBe('Network error');
        },
      });

      expect(service.loading()).toBe(false);
    });

    it('should clear previous error before loading', () => {
      mockApiService.getAll.mockReturnValue(of(mockPagedResponse([mockListItem])));

      service.loadAll().subscribe(() => {
        expect(service.error()).toBeNull();
      });
    });
  });

  describe('loadById()', () => {
    it('should load customer by id and update currentCustomer signal', () => {
      mockApiService.getById.mockReturnValue(of(mockDetails));

      service.loadById('uuid-001').subscribe((customer) => {
        expect(customer.id).toBe('uuid-001');
        expect(service.currentCustomer()?.id).toBe('uuid-001');
      });

      expect(service.loading()).toBe(false);
    });

    it('should set error when customer not found', () => {
      mockApiService.getById.mockReturnValue(throwError(() => new Error('Not found')));

      service.loadById('uuid-999').subscribe({
        error: () => {
          expect(service.error()).toBe('Not found');
        },
      });

      expect(service.loading()).toBe(false);
    });
  });

  describe('create()', () => {
    it('should create customer', () => {
      mockApiService.getAll.mockReturnValue(of([]));
      mockApiService.create.mockReturnValue(of(mockDetails));

      service.loadAll().subscribe();

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

      let createdCustomerId: string | undefined;
      service.create(createData).subscribe((createdCustomer) => {
        createdCustomerId = createdCustomer.id;
      });

      expect(mockApiService.create).toHaveBeenCalledWith(createData);
      expect(createdCustomerId).toBe('uuid-001');
      expect(service.loading()).toBe(false);
    });

    it('should set error on create failure', () => {
      mockApiService.create.mockReturnValue(throwError(() => new Error('Conflict')));

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

      service.create(createData).subscribe({
        error: () => {
          expect(service.error()).toBe('Conflict');
        },
      });

      expect(service.loading()).toBe(false);
    });
  });

  describe('update()', () => {
    it('should update customer and refresh list item', () => {
      mockApiService.getAll.mockReturnValue(of(mockPagedResponse([mockListItem])));
      service.loadAll().subscribe();

      const updatedDetails: CustomerDetails = {
        ...mockDetails,
        legalName: 'Acme C.A. Updated',
        alias: 'ACME Updated',
      };
      mockApiService.update.mockReturnValue(of(updatedDetails));

      const editData: CustomerEdit = {
        id: 'uuid-001',
        legalName: 'Acme C.A. Updated',
        type: CustomerType.BUSINESS,
        rif: 'J-12345678-9',
        alias: 'ACME Updated',
        creditDays: 30,
        creditLimit: 50000,
        active: true,
        emails: [{ email: 'contact@acme.com' }],
        phones: [{ phone: '0212-1234567' }],
        addresses: [{ address: 'Av. Principal', billing: true, active: true }],
      };

      service.update('uuid-001', editData).subscribe(() => {
        const updated = service.customers().find((c) => c.id === 'uuid-001');
        expect(updated?.alias).toBe('ACME Updated');
      });

      expect(service.loading()).toBe(false);
    });

    it('should update currentCustomer if it matches', () => {
      mockApiService.getById.mockReturnValue(of(mockDetails));
      service.loadById('uuid-001').subscribe();

      const updatedDetails: CustomerDetails = { ...mockDetails, alias: 'New Alias' };
      mockApiService.update.mockReturnValue(of(updatedDetails));

      const editData: CustomerEdit = {
        id: 'uuid-001',
        legalName: 'Acme C.A.',
        type: CustomerType.BUSINESS,
        rif: 'J-12345678-9',
        alias: 'New Alias',
        creditDays: 30,
        creditLimit: 50000,
        active: true,
        emails: [{ email: 'contact@acme.com' }],
        phones: [{ phone: '0212-1234567' }],
        addresses: [{ address: 'Av. Principal', billing: true, active: true }],
      };

      service.update('uuid-001', editData).subscribe(() => {
        expect(service.currentCustomer()?.alias).toBe('New Alias');
      });
    });
  });

  describe('delete()', () => {
    it('should delete customer and remove from list', () => {
      mockApiService.getAll.mockReturnValue(of(mockPagedResponse([mockListItem])));
      service.loadAll().subscribe();

      mockApiService.delete.mockReturnValue(of(undefined));

      service.delete('uuid-001').subscribe(() => {
        expect(service.customers()).toHaveLength(0);
      });

      expect(service.loading()).toBe(false);
    });

    it('should set error on delete failure', () => {
      mockApiService.delete.mockReturnValue(throwError(() => new Error('Delete failed')));

      service.delete('uuid-001').subscribe({
        error: () => {
          expect(service.error()).toBe('Delete failed');
        },
      });

      expect(service.loading()).toBe(false);
    });
  });
});
