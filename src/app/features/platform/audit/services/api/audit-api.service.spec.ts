import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuditApiService } from '@features/platform/audit/services/api/audit-api.service';
import { AuditEvent, AuditFilters } from '@features/platform/audit/models';

describe('AuditApiService', () => {
  let service: AuditApiService;
  let httpMock: HttpTestingController;

  const filters: AuditFilters = {
    entityType: 'INVOICE',
    entityId: 'inv-001',
    module: 'billing',
    action: ['CONFIRM', 'CANCEL'],
    actorId: 'user-1',
    from: '2025-01-01T00:00:00.000Z',
    to: '2025-01-31T23:59:59.999Z',
    page: 0,
    size: 20,
  };

  const page = {
    content: [
      {
        id: 'event-1',
        module: 'billing',
        entityType: 'INVOICE',
        entityId: 'inv-001',
        entityLabel: 'FAC-001',
        secondaryLabel: null,
        action: 'CONFIRM',
        actor: { id: 'user-1', name: 'Jane Doe', photoUrl: null },
        occurredAt: '2025-01-02T10:00:00Z',
        descriptionKey: 'audit.descriptions.CONFIRM.INVOICE',
        descriptionArgs: ['FAC-001'],
        changes: [],
        metadata: null,
      },
    ],
    totalElements: 1,
    totalPages: 1,
    size: 20,
    number: 0,
    first: true,
    last: true,
    empty: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuditApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuditApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests audit events with every filter as query params', () => {
    service.getAll(filters).subscribe((result) => {
      expect(result.content).toHaveLength(1);
      expect(result.totalElements).toBe(1);
    });

    const request = httpMock.expectOne((candidate) => candidate.url === '/api/audit-events');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('entityType')).toBe('INVOICE');
    expect(request.request.params.get('entityId')).toBe('inv-001');
    expect(request.request.params.get('module')).toBe('billing');
    expect(request.request.params.get('actorId')).toBe('user-1');
    expect(request.request.params.get('from')).toBe('2025-01-01T00:00:00.000Z');
    expect(request.request.params.get('to')).toBe('2025-01-31T23:59:59.999Z');
    expect(request.request.params.get('page')).toBe('0');
    expect(request.request.params.get('size')).toBe('20');
    expect(request.request.params.getAll('action')).toEqual(['CONFIRM', 'CANCEL']);
    request.flush(page);
  });

  it('builds a module-only query without entity parameters', () => {
    service.getAll({ module: 'finance', page: 0, size: 20 }).subscribe();

    const request = httpMock.expectOne((candidate) => candidate.url === '/api/audit-events');
    expect(request.request.params.has('entityType')).toBe(false);
    expect(request.request.params.has('entityId')).toBe(false);
    expect(request.request.params.get('module')).toBe('finance');
    request.flush({ ...page, content: [], totalElements: 0, totalPages: 0, empty: true });
  });

  it('maps missing nullable fields to safe defaults', () => {
    let mapped: AuditEvent | undefined;
    service.getAll(filters).subscribe((result) => {
      mapped = result.content[0];
    });

    const request = httpMock.expectOne((candidate) => candidate.url === '/api/audit-events');
    request.flush({
      ...page,
      content: [
        {
          id: 'event-2',
          module: 'billing',
          entityType: 'INVOICE',
          entityId: 'inv-002',
          entityLabel: 'FAC-002',
          action: 'CREATE',
          occurredAt: '2025-01-02T10:00:00Z',
          descriptionKey: 'audit.descriptions.CREATE.INVOICE',
        },
      ],
    });

    expect(mapped).toBeDefined();
    expect(mapped?.actor).toEqual({ id: null, name: '', photoUrl: null });
    expect(mapped?.secondaryLabel).toBeNull();
    expect(mapped?.descriptionArgs).toEqual([]);
    expect(mapped?.changes).toEqual([]);
    expect(mapped?.metadata).toBeNull();
  });

  it('requests the filter options endpoint scoped to the entity', () => {
    service
      .getFilterOptions({ entityType: 'INVOICE', entityId: 'inv-001', module: 'billing' })
      .subscribe((options) => {
        expect(options.actions).toEqual([
          { value: 'CREATE', labelKey: 'audit.actions.CREATE', count: 2 },
        ]);
        expect(options.actors).toEqual([
          { id: 'user-1', name: 'Jane Doe', photoUrl: null, count: 3 },
        ]);
        expect(options.dateRange).toEqual({ min: '2025-01-01T00:00:00Z', max: null });
      });

    const request = httpMock.expectOne(
      (candidate) => candidate.url === '/api/audit-events/filter-options',
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('entityType')).toBe('INVOICE');
    expect(request.request.params.get('entityId')).toBe('inv-001');
    expect(request.request.params.get('module')).toBe('billing');
    request.flush({
      actions: [{ value: 'CREATE', labelKey: 'audit.actions.CREATE', count: 2 }],
      actors: [{ id: 'user-1', name: 'Jane Doe', count: 3 }],
      dateRange: { min: '2025-01-01T00:00:00Z', max: null },
    });
  });

  it('requests a single audit event by id', () => {
    service.getById('event-1').subscribe((event) => {
      expect(event.id).toBe('event-1');
    });

    const request = httpMock.expectOne('/api/audit-events/event-1');
    expect(request.request.method).toBe('GET');
    request.flush(page.content[0]);
  });
});
