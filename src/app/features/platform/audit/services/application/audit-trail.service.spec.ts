import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuditApiService } from '@features/platform/audit/services/api/audit-api.service';
import { AuditTrailService } from '@features/platform/audit/services/application/audit-trail.service';
import { AuditEvent } from '@features/platform/audit/models';

describe('AuditTrailService', () => {
  const event: AuditEvent = {
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
  };

  const page = (totalElements = 1) => ({
    content: [event],
    totalElements,
    totalPages: Math.max(1, Math.ceil(totalElements / 20)),
    size: 20,
    number: 0,
    first: true,
    last: totalElements <= 20,
    empty: false,
  });

  let service: AuditTrailService;
  let api: {
    getAll: ReturnType<typeof vi.fn>;
    getFilterOptions: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    api = {
      getAll: vi.fn(() => of(page())),
      getFilterOptions: vi.fn(() =>
        of({
          actions: [{ value: 'CONFIRM', labelKey: 'audit.actions.CONFIRM', count: 1 }],
          actors: [],
          dateRange: null,
        }),
      ),
    };

    TestBed.configureTestingModule({
      providers: [AuditTrailService, { provide: AuditApiService, useValue: api }],
    });

    service = TestBed.inject(AuditTrailService);
  });

  it('opens an entity, loads its events and filter options', () => {
    service.open({ entityType: 'INVOICE', entityId: 'inv-001', label: 'FAC-001' });

    expect(api.getAll).toHaveBeenCalledWith(
      expect.objectContaining({ entityType: 'INVOICE', entityId: 'inv-001', page: 0 }),
    );
    expect(api.getFilterOptions).toHaveBeenCalledWith(
      expect.objectContaining({ entityType: 'INVOICE', entityId: 'inv-001' }),
    );
    expect(service.events()).toEqual([event]);
    expect(service.totalElements()).toBe(1);
    expect(service.filterOptions()).toEqual({
      actions: [{ value: 'CONFIRM', labelKey: 'audit.actions.CONFIRM', count: 1 }],
      actors: [],
      dateRange: null,
    });
  });

  it('opens a global module history without an entity', () => {
    service.open({ module: 'finance', label: 'Finance' });

    expect(service.filters()).toEqual(
      expect.objectContaining({ module: 'finance', page: 0, size: 20 }),
    );
    expect(service.filters().entityType).toBeUndefined();
    expect(api.getAll).toHaveBeenCalledWith(
      expect.objectContaining({ module: 'finance', page: 0 }),
    );
  });

  it('resets to the first page when filters are applied', () => {
    service.open({ entityType: 'INVOICE', entityId: 'inv-001', label: 'FAC-001' });
    service.goToPage(1);

    service.applyFilters({ action: ['CANCEL'], actorId: 'user-2' });

    expect(service.filters()).toEqual(
      expect.objectContaining({
        action: ['CANCEL'],
        actorId: 'user-2',
        page: 0,
      }),
    );
    expect(api.getAll).toHaveBeenLastCalledWith(
      expect.objectContaining({ action: ['CANCEL'], actorId: 'user-2', page: 0 }),
    );
  });

  it('paginates forward and backward respecting limits', () => {
    api.getAll.mockReturnValue(of(page(45)));

    service.open({ entityType: 'INVOICE', label: 'FAC-001' });
    expect(service.totalPages()).toBe(3);

    service.nextPage();
    expect(service.page()).toBe(1);

    service.previousPage();
    expect(service.page()).toBe(0);
    service.previousPage();
    expect(service.page()).toBe(0);

    service.goToPage(99);
    expect(service.page()).toBe(2);
  });

  it('exposes the error and stops loading when the request fails', () => {
    api.getAll.mockReturnValue(throwError(() => new Error('boom')));

    service.open({ entityType: 'INVOICE', label: 'FAC-001' });

    expect(service.error()).toBe('boom');
    expect(service.loading()).toBe(false);
    expect(service.events()).toEqual([]);
  });

  it('prefers the backend error message over the HTTP failure text', () => {
    api.getAll.mockReturnValue(
      throwError(() => ({ error: { message: 'El rango de fechas no es válido' } })),
    );

    service.open({ module: 'finance', label: 'Finance' });

    expect(service.error()).toBe('El rango de fechas no es válido');
  });

  it('clears filters while keeping the entity scope', () => {
    service.open({
      entityType: 'INVOICE',
      entityId: 'inv-001',
      module: 'billing',
      label: 'FAC-001',
    });
    service.applyFilters({
      action: ['CANCEL'],
      actorId: 'user-2',
      from: '2025-01-01',
      to: '2025-01-31',
      size: 50,
    });

    service.clearFilters();

    const filters = service.filters();
    expect(filters.entityType).toBe('INVOICE');
    expect(filters.entityId).toBe('inv-001');
    expect(filters.module).toBe('billing');
    expect(filters.action).toBeUndefined();
    expect(filters.actorId).toBeUndefined();
    expect(filters.from).toBeUndefined();
    expect(filters.to).toBeUndefined();
    expect(filters.page).toBe(0);
    expect(filters.size).toBe(50);
  });

  it('reloads with the current filters', () => {
    service.open({ entityType: 'INVOICE', label: 'FAC-001' });
    api.getAll.mockClear();

    service.reload();

    expect(api.getAll).toHaveBeenCalledWith(service.filters());
  });
});
