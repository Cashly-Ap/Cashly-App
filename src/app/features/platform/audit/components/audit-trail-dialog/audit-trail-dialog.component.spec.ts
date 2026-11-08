import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AuditTrailDialogComponent } from '@features/platform/audit/components/audit-trail-dialog/audit-trail-dialog.component';
import { AuditTrailService } from '@features/platform/audit/services/application/audit-trail.service';
import { AuditTrailDialogService } from '@shared/services/audit-trail-dialog.service';
import { AuditAction, AuditFilters, AuditTrailRequest } from '@features/platform/audit/models';

@Component({
  template: `<app-audit-trail-dialog [request]="request" />`,
  imports: [AuditTrailDialogComponent],
  schemas: [NO_ERRORS_SCHEMA],
})
class HostComponent {
  request: AuditTrailRequest = {
    entityType: 'INVOICE',
    entityId: 'inv-001',
    label: 'FAC-001',
    subtitle: 'Acme',
  };
}

describe('AuditTrailDialogComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let component: AuditTrailDialogComponent;
  let trail: {
    events: ReturnType<typeof signal>;
    filterOptions: ReturnType<typeof signal>;
    filters: ReturnType<typeof signal<AuditFilters>>;
    loading: ReturnType<typeof signal>;
    error: ReturnType<typeof signal>;
    totalElements: ReturnType<typeof signal<number>>;
    page: ReturnType<typeof signal<number>>;
    open: ReturnType<typeof vi.fn>;
    reload: ReturnType<typeof vi.fn>;
    applyFilters: ReturnType<typeof vi.fn>;
    clearFilters: ReturnType<typeof vi.fn>;
    goToPage: ReturnType<typeof vi.fn>;
  };
  let dialog: AuditTrailDialogService;

  beforeEach(() => {
    trail = {
      events: signal([]),
      filterOptions: signal({
        actions: [
          { value: 'CREATE' as AuditAction, labelKey: 'audit.actions.CREATE', count: 0 },
          { value: 'CONFIRM' as AuditAction, labelKey: 'audit.actions.CONFIRM', count: 0 },
        ],
        actors: [
          { id: 'user-1', name: 'Jane Doe', photoUrl: null, count: 2 },
          { id: null, name: 'System', photoUrl: null, count: 0 },
        ],
        dateRange: { min: '2025-01-01T00:00:00Z', max: '2025-01-31T23:59:59Z' },
      }),
      filters: signal<AuditFilters>({ entityType: 'INVOICE', page: 0, size: 20 }),
      loading: signal(false),
      error: signal<string | null>(null),
      totalElements: signal(0),
      page: signal(0),
      open: vi.fn(),
      reload: vi.fn(),
      applyFilters: vi.fn(),
      clearFilters: vi.fn(),
      goToPage: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: AuditTrailService, useValue: trail }],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
    dialog = TestBed.inject(AuditTrailDialogService);
  });

  it('opens the trail for the requested entity on init', () => {
    expect(trail.open).toHaveBeenCalledWith({
      entityType: 'INVOICE',
      entityId: 'inv-001',
      label: 'FAC-001',
      subtitle: 'Acme',
    });
  });

  it('builds translated action options and excludes actors without id', () => {
    const actions = component.actionOptions();
    expect(actions.map((option) => option.value)).toEqual(['CREATE', 'CONFIRM']);
    expect(actions[0].label).toBe('Creación');

    const actors = component.actorOptions();
    expect(actors).toEqual([{ label: 'Jane Doe', value: 'user-1' }]);

    expect(component.minDate()?.toISOString()).toBe('2025-01-01T00:00:00.000Z');
    expect(component.maxDate()?.toISOString()).toBe('2025-01-31T23:59:59.000Z');
  });

  it('applies action and actor filters', () => {
    component.onActionsChange(['CANCEL']);
    expect(trail.applyFilters).toHaveBeenCalledWith({ action: ['CANCEL'] });

    component.onActorChange('user-1');
    expect(trail.applyFilters).toHaveBeenCalledWith({ actorId: 'user-1' });

    component.onActionsChange([]);
    expect(trail.applyFilters).toHaveBeenLastCalledWith({ action: undefined });
  });

  it('clears local filters and delegates to the trail service', () => {
    component.selectedActions.set(['CANCEL']);
    component.selectedActorId.set('user-1');
    component.fromDate.set(new Date('2025-01-01'));
    component.toDate.set(new Date('2025-01-31'));

    component.clearFilters();

    expect(component.selectedActions()).toEqual([]);
    expect(component.selectedActorId()).toBeNull();
    expect(component.fromDate()).toBeNull();
    expect(component.toDate()).toBeNull();
    expect(trail.clearFilters).toHaveBeenCalled();
  });

  it('changes page size or page number', () => {
    component.onPageChange({ page: 2, rows: 20, first: 40 });
    expect(trail.goToPage).toHaveBeenCalledWith(2);

    component.onPageChange({ page: 0, rows: 50, first: 0 });
    expect(trail.applyFilters).toHaveBeenCalledWith({ size: 50 });
  });

  it('closes the dialog and clears the request on hide', () => {
    component.close();
    expect(component.visible()).toBe(false);

    component.onHidden();
    expect(dialog.request()).toBeNull();
  });
});
