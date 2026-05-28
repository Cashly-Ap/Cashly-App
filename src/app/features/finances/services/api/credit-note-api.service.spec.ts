import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CreditNoteApiService, CreditNoteFilters } from './credit-note-api.service';

describe('CreditNoteApiService', () => {
  let service: CreditNoteApiService;
  let httpMock: HttpTestingController;

  const mockList = [
    {
      id: 'cn-001',
      noteNumber: 'NC-001',
      customerId: 'c1',
      customerName: 'Test Customer',
      invoiceNumber: 'FAC-001',
      amount: 500,
      appliedAmount: 0,
      createdAt: '2025-01-01T00:00:00Z',
    },
  ];

  const mockDetails = {
    id: 'cn-001',
    noteNumber: 'NC-001',
    customerId: 'c1',
    customerName: 'Test Customer',
    customerRif: 'J-12345678-9',
    invoiceId: 'inv-001',
    invoiceNumber: 'FAC-001',
    amount: 500,
    appliedAmount: 0,
    remainingAmount: 500,
    reason: 'Test reason',
    createdBy: 'user-001',
    createdByName: 'John Doe',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [CreditNoteApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CreditNoteApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAll()', () => {
    it('should GET /api/finances/credit-notes without filters', () => {
      service.getAll().subscribe((result) => {
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('cn-001');
      });

      const req = httpMock.expectOne('/api/finances/credit-notes');
      expect(req.request.method).toBe('GET');
      req.flush(mockList);
    });

    it('should GET with search filter', () => {
      const filters: CreditNoteFilters = { search: 'NC-001' };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/finances/credit-notes' && r.method === 'GET');
      expect(req.request.params.get('search')).toBe('NC-001');
      req.flush([]);
    });

    it('should GET with customerId filter', () => {
      const filters: CreditNoteFilters = { customerId: 'c1' };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/finances/credit-notes' && r.method === 'GET');
      expect(req.request.params.get('customerId')).toBe('c1');
      req.flush([]);
    });

    it('should GET with date filters', () => {
      const filters: CreditNoteFilters = { dateFrom: '2025-01-01', dateTo: '2025-01-31' };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/finances/credit-notes' && r.method === 'GET');
      expect(req.request.params.get('dateFrom')).toBe('2025-01-01');
      expect(req.request.params.get('dateTo')).toBe('2025-01-31');
      req.flush([]);
    });
  });

  describe('getById()', () => {
    it('should GET /api/finances/credit-notes/:id', () => {
      service.getById('cn-001').subscribe((result) => {
        expect(result.id).toBe('cn-001');
        expect(result.reason).toBe('Test reason');
      });

      const req = httpMock.expectOne('/api/finances/credit-notes/cn-001');
      expect(req.request.method).toBe('GET');
      req.flush(mockDetails);
    });
  });

  describe('create()', () => {
    it('should POST /api/finances/credit-notes', () => {
      const createData = {
        customerId: 'c1',
        invoiceId: 'inv-001',
        amount: 500,
        reason: 'Test',
      };

      service.create(createData).subscribe((result) => {
        expect(result.id).toBe('cn-001');
      });

      const req = httpMock.expectOne('/api/finances/credit-notes');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createData);
      req.flush(mockDetails);
    });
  });
});
