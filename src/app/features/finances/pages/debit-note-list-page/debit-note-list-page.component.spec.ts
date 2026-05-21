import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DebitNoteListPageComponent } from './debit-note-list-page.component';
import { FinanceApplicationService } from '@features/finances/services/application/finance-application.service';

describe('DebitNoteListPageComponent', () => {
  let component: DebitNoteListPageComponent;
  let fixture: ComponentFixture<DebitNoteListPageComponent>;
  let mockService: Partial<FinanceApplicationService>;
  let router: Router;

  const mockNotes = [
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

  function configureTestBed(loadAllValue: any = of(mockNotes)) {
    mockService = {
      loadDebitNotes: vi.fn().mockReturnValue(loadAllValue),
      createDebitNote: vi.fn().mockReturnValue(of({})),
      cancelDebitNote: vi.fn().mockReturnValue(of({})),
      debitNotes: signal(mockNotes),
      loading: signal(false),
      error: signal(null),
      totalElements: signal(1),
    };

    TestBed.configureTestingModule({
      imports: [DebitNoteListPageComponent],
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
    fixture = TestBed.createComponent(DebitNoteListPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  }

  beforeEach(() => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed();
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load debit notes on init', () => {
    fixture.detectChanges();
    expect(mockService.loadDebitNotes).toHaveBeenCalled();
  });

  describe('navigation', () => {
    it('should navigate to /finanzas/notas-debito/nuevo on create', () => {
      fixture.detectChanges();
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onCreate();
      expect(navigateSpy).toHaveBeenCalledWith(['/finanzas/notas-debito', 'nuevo']);
    });

    it('should navigate to /finanzas/notas-debito/{id} on view', () => {
      fixture.detectChanges();
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onView(mockNotes[0]);
      expect(navigateSpy).toHaveBeenCalledWith(['/finanzas/notas-debito', 'dn-001']);
    });
  });

  describe('filtering', () => {
    it('should update searchTerm and reload on search', () => {
      fixture.detectChanges();
      component.onSearch('test');
      expect(component.searchTerm()).toBe('test');
      expect(mockService.loadDebitNotes).toHaveBeenCalled();
    });

    it('should clear filters', () => {
      fixture.detectChanges();
      component.selectedStatus.set('PENDING');
      component.clearFilters();
      expect(component.selectedStatus()).toBe('');
    });
  });

  describe('status helpers', () => {
    it('should get status label', () => {
      fixture.detectChanges();
      expect(component.getStatusLabel('PENDING')).toBe('Pendiente');
    });

    it('should get status variant', () => {
      fixture.detectChanges();
      expect(component.getStatusVariant('PENDING')).toBe('info');
      expect(component.getStatusVariant('APPLIED')).toBe('success');
      expect(component.getStatusVariant('CANCELLED')).toBe('danger');
    });

    it('should check canCancel', () => {
      fixture.detectChanges();
      expect(component.canCancel('PENDING')).toBe(true);
      expect(component.canCancel('CANCELLED')).toBe(false);
      expect(component.canCancel('APPLIED')).toBe(false);
    });
  });
});
