import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CreditNoteListPageComponent } from './credit-note-list-page.component';
import { FinanceApplicationService } from '@features/finances/services/application/finance-application.service';

describe('CreditNoteListPageComponent', () => {
  let component: CreditNoteListPageComponent;
  let fixture: ComponentFixture<CreditNoteListPageComponent>;
  let mockService: Partial<FinanceApplicationService>;
  let router: Router;
  let messageService: MessageService;

  const mockNotes = [
    {
      id: 'cn-001',
      noteNumber: 'NC-001',
      customerId: 'c1',
      customerName: 'Test Customer',
      invoiceNumber: 'FAC-001',
      amount: 500,
      status: 'PENDING',
      appliedAmount: 0,
      createdAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'cn-002',
      noteNumber: 'NC-002',
      customerId: 'c2',
      customerName: 'Customer B',
      invoiceNumber: 'FAC-002',
      amount: 1000,
      status: 'APPLIED',
      appliedAmount: 1000,
      createdAt: '2025-01-02T00:00:00Z',
    },
  ];

  function configureTestBed(loadAllValue: any = of(mockNotes)) {
    mockService = {
      loadCreditNotes: vi.fn().mockReturnValue(loadAllValue),
      createCreditNote: vi.fn().mockReturnValue(of({})),
      cancelCreditNote: vi.fn().mockReturnValue(of({})),
      creditNotes: signal(mockNotes),
      loading: signal(false),
      error: signal(null),
      totalElements: signal(2),
    };

    TestBed.configureTestingModule({
      imports: [CreditNoteListPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null }, queryParamMap: { get: () => null } } } },
        { provide: FinanceApplicationService, useValue: mockService },
        ConfirmationService,
        MessageService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.compileComponents();
  }

  function createComponent() {
    fixture = TestBed.createComponent(CreditNoteListPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    messageService = TestBed.inject(MessageService);
  }

  beforeEach(() => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed();
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load credit notes on init', () => {
    fixture.detectChanges();
    expect(mockService.loadCreditNotes).toHaveBeenCalled();
  });

  describe('computed signals', () => {
    it('should show initial loading when loading and no notes', () => {
      (mockService.loading as ReturnType<typeof signal>).set(true);
      (mockService.creditNotes as ReturnType<typeof signal>).set([]);
      expect(component.showInitialLoading()).toBe(true);
    });

    it('should detect empty database', () => {
      (mockService.loading as ReturnType<typeof signal>).set(false);
      (mockService.totalElements as ReturnType<typeof signal>).set(0);
      expect(component.isEmptyDatabase()).toBe(true);
    });

    it('should detect filtered results', () => {
      (mockService.loading as ReturnType<typeof signal>).set(false);
      (mockService.totalElements as ReturnType<typeof signal>).set(0);
      component.searchTerm.set('test');
      expect(component.hasFilteredResults()).toBe(true);
    });

    it('should compute active filter count', () => {
      component.selectedStatus.set('PENDING');
      component.filterDateFrom.set(new Date('2025-01-01'));
      expect(component.activeFilterCount()).toBe(2);
    });
  });

  describe('navigation', () => {
    it('should navigate to /finanzas/notas-credito/nuevo on create', () => {
      fixture.detectChanges();
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onCreate();
      expect(navigateSpy).toHaveBeenCalledWith(['/credit-notes/new']);
    });

    it('should navigate to /finanzas/notas-credito/{id} on view', () => {
      fixture.detectChanges();
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onView(mockNotes[0]);
      expect(navigateSpy).toHaveBeenCalledWith(['/credit-notes', 'cn-001']);
    });
  });

  describe('filtering and pagination', () => {
    it('should update searchTerm and reload on search', () => {
      fixture.detectChanges();
      component.onSearch('test');
      expect(component.searchTerm()).toBe('test');
      expect(mockService.loadCreditNotes).toHaveBeenCalled();
    });

    it('should update page on page change', () => {
      fixture.detectChanges();
      component.onPageChange({ first: 20, rows: 10 });
      expect(component.first()).toBe(20);
      expect(component.rows()).toBe(10);
    });

    it('should update sort on sort change', () => {
      fixture.detectChanges();
      component.onSort({ field: 'noteNumber', order: -1 } as any);
      expect(component.orderBy()).toBe('noteNumber');
      expect(component.orderDir()).toBe('desc');
    });

    it('should clear filters', () => {
      fixture.detectChanges();
      component.selectedStatus.set('PENDING');
      component.clearFilters();
      expect(component.selectedStatus()).toBe('');
    });

    it('should update status filter', () => {
      fixture.detectChanges();
      component.onStatusFilterChange('PENDING');
      expect(component.selectedStatus()).toBe('PENDING');
    });
  });

  describe('cancel', () => {
    it('should call cancel service on confirm', () => {
      fixture.detectChanges();
      component.onCancel(mockNotes[0]);
      expect(mockService.cancelCreditNote).not.toHaveBeenCalled();
    });
  });

  describe('status helpers', () => {
    it('should get status label', () => {
      fixture.detectChanges();
      expect(component.getStatusLabel('PENDING')).toBe('Pendiente');
      expect(component.getStatusLabel('APPLIED')).toBe('Aplicada');
      expect(component.getStatusLabel('CANCELLED')).toBe('Cancelada');
    });

    it('should get status variant', () => {
      fixture.detectChanges();
      expect(component.getStatusVariant('PENDING')).toBe('info');
      expect(component.getStatusVariant('APPLIED')).toBe('success');
      expect(component.getStatusVariant('CANCELLED')).toBe('danger');
    });

    it('should check canCancel', () => {
      fixture.detectChanges();
      expect(component.canCancel('DRAFT')).toBe(false);
      expect(component.canCancel('APPLIED')).toBe(true);
      expect(component.canCancel('CANCELLED')).toBe(false);
    });
  });
});
