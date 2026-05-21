import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DebitNoteApiService, DebitNoteFilters } from './debit-note-api.service';

describe('DebitNoteApiService', () => {
  let service: DebitNoteApiService;
  let httpMock: HttpTestingController;

  const mockList = [
    {
      id: 'dn-001',
      noteNumber: 'ND-001',
      customerId: 'c1',
      customerName: 'Test Customer',
      invoiceNumber: 'FAC-001',
      amount: 500,
      status: 'PENDING',
      appliedAmount: 0,
      createdAt: '2025-01-01T00:00:00Z',
    },
  ];

  const mockDetails = {
    id: 'dn-001',
    noteNumber: 'ND-001',
    customerId: 'c1',
    customerName: 'Test Customer',
    customerRif: 'J-12345678-9',
    invoiceId: 'inv-001',
    invoiceNumber: 'FAC-001',
    amount: 500,
    appliedAmount: 0,
    remainingAmount: 500,
    status: 'PENDING',
    reason: 'Test reason',
    createdBy: 'user-001',
    createdByName: 'John Doe',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [DebitNoteApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(DebitNoteApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAll()', () => {
    it('should GET /api/finances/debit-notes without filters', () => {
      service.getAll().subscribe((result) => {
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('dn-001');
      });

      const req = httpMock.expectOne('/api/finances/debit-notes');
      expect(req.request.method).toBe('GET');
      req.flush(mockList);
    });

    it('should GET with search filter', () => {
      const filters: DebitNoteFilters = { search: 'ND-001' };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/finances/debit-notes' && r.method === 'GET');
      expect(req.request.params.get('search')).toBe('ND-001');
      req.flush([]);
    });

    it('should GET with customerId filter', () => {
      const filters: DebitNoteFilters = { customerId: 'c1' };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/finances/debit-notes' && r.method === 'GET');
      expect(req.request.params.get('customerId')).toBe('c1');
      req.flush([]);
    });

    it('should GET with status filter', () => {
      const filters: DebitNoteFilters = { status: 'PENDING' };

      service.getAll(filters).subscribe();

      const req = httpMock.expectOne((r) => r.url === '/api/finances/debit-notes' && r.method === 'GET');
      expect(req.request.params.get('status')).toBe('PENDING');
      req.flush([]);
    });
  });

  describe('getById()', () => {
    it('should GET /api/finances/debit-notes/:id', () => {
      service.getById('dn-001').subscribe((result) => {
        expect(result.id).toBe('dn-001');
      });

      const req = httpMock.expectOne('/api/finances/debit-notes/dn-001');
      expect(req.request.method).toBe('GET');
      req.flush(mockDetails);
    });
  });

  describe('create()', () => {
    it('should POST /api/finances/debit-notes', () => {
      const createData = {
        customerId: 'c1',
        invoiceId: 'inv-001',
        amount: 500,
        reason: 'Test',
      };

      service.create(createData).subscribe((result) => {
        expect(result.id).toBe('dn-001');
      });

      const req = httpMock.expectOne('/api/finances/debit-notes');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createData);
      req.flush(mockDetails);
    });
  });

  describe('apply()', () => {
    it('should PUT /api/finances/debit-notes/:id/apply', () => {
      service.apply('dn-001', 'inv-002', 200).subscribe((result) => {
        expect(result.id).toBe('dn-001');
      });

      const req = httpMock.expectOne('/api/finances/debit-notes/dn-001/apply');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ invoiceId: 'inv-002', amount: 200 });
      req.flush(mockDetails);
    });
  });

  describe('cancel()', () => {
    it('should PUT /api/finances/debit-notes/:id/cancel', () => {
      service.cancel('dn-001').subscribe((result) => {
        expect(result.id).toBe('dn-001');
      });

      const req = httpMock.expectOne('/api/finances/debit-notes/dn-001/cancel');
      expect(req.request.method).toBe('PUT');
      req.flush(mockDetails);
    });
  });
});
