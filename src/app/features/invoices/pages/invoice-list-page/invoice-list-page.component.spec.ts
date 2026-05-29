import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InvoiceListPageComponent } from './invoice-list-page.component';
import { InvoiceApplicationService } from '@features/invoices/services/application/invoice-application.service';
import { InvoiceStatus } from '@features/invoices/models/enums/invoice-status.enum';
import { PaymentType } from '@features/invoices/models/enums/payment-type.enum';
import { PdfViewerService } from '@core/pdf-viewer';

describe('InvoiceListPageComponent', () => {
  let component: InvoiceListPageComponent;
  let fixture: ComponentFixture<InvoiceListPageComponent>;
  let mockService: Partial<InvoiceApplicationService>;
  let router: Router;
  let messageService: MessageService;

  const mockInvoices = [
    {
      id: 'inv-001',
      invoiceNumber: 'FAC-001',
      customerId: 'c1',
      customerName: 'Test Customer',
      status: InvoiceStatus.DRAFT,
      paymentType: PaymentType.CASH,
      subtotal: 500,
      lineCount: 2,
      orderId: null,
      orderNumber: null,
      createdAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'inv-002',
      invoiceNumber: 'FAC-002',
      customerId: 'c2',
      customerName: 'Customer B',
      status: InvoiceStatus.PAID,
      paymentType: PaymentType.CREDIT,
      subtotal: 1000,
      lineCount: 3,
      orderId: 'ord-001',
      orderNumber: 'ORD-001',
      createdAt: '2025-01-02T00:00:00Z',
    },
  ];

  const mockPdfViewer = {
    open: vi.fn(),
  };

  function configureTestBed(loadAllValue: any = of(mockInvoices)) {
    mockService = {
      loadAll: vi.fn().mockReturnValue(loadAllValue),
      loadById: vi.fn().mockReturnValue(of({})),
      create: vi.fn().mockReturnValue(of({})),
      update: vi.fn().mockReturnValue(of({})),
      cancel: vi.fn().mockReturnValue(of({})),
      delete: vi.fn().mockReturnValue(of(undefined)),
      confirm: vi.fn().mockReturnValue(of({})),
      duplicate: vi.fn().mockReturnValue(of({})),
      invoices: signal(mockInvoices),
      currentInvoice: signal(null),
      loading: signal(false),
      error: signal(null),
      totalElements: signal(2),
    };

    TestBed.configureTestingModule({
      imports: [InvoiceListPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null }, queryParamMap: { get: () => null } } } },
        { provide: InvoiceApplicationService, useValue: mockService },
        ConfirmationService,
        MessageService,
        { provide: PdfViewerService, useValue: mockPdfViewer },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.compileComponents();
  }

  function createComponent() {
    fixture = TestBed.createComponent(InvoiceListPageComponent);
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

  it('should load invoices on init', () => {
    fixture.detectChanges();
    expect(mockService.loadAll).toHaveBeenCalled();
  });

  describe('computed signals', () => {
    it('should show initial loading when loading and no invoices', () => {
      (mockService.loading as ReturnType<typeof signal>).set(true);
      (mockService.invoices as ReturnType<typeof signal>).set([]);
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
      component.selectedStatus.set('DRAFT');
      component.filterPaymentType.set('CASH');
      expect(component.activeFilterCount()).toBe(2);
    });
  });

  describe('navigation', () => {
    it('should navigate to /invoices/new on create', () => {
      fixture.detectChanges();
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onCreate();
      expect(navigateSpy).toHaveBeenCalledWith(['/invoices/new']);
    });

    it('should navigate to /facturas/{id} on view', () => {
      fixture.detectChanges();
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onView(mockInvoices[0]);
      expect(navigateSpy).toHaveBeenCalledWith(['/invoices', 'inv-001']);
    });

    it('should navigate to /invoices/{id}/edit on edit', () => {
      fixture.detectChanges();
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onEdit(mockInvoices[0]);
      expect(navigateSpy).toHaveBeenCalledWith(['/invoices', 'inv-001', 'edit']);
    });
  });

  describe('filtering and pagination', () => {
    it('should update searchTerm and reload on search', () => {
      fixture.detectChanges();
      component.onSearch('test');
      expect(component.searchTerm()).toBe('test');
      expect(mockService.loadAll).toHaveBeenCalled();
    });

    it('should update page on page change', () => {
      fixture.detectChanges();
      component.onPageChange({ first: 20, rows: 10 });
      expect(component.first()).toBe(20);
      expect(component.rows()).toBe(10);
    });

    it('should update sort on sort change', () => {
      fixture.detectChanges();
      component.onSort({ field: 'invoiceNumber', order: -1 } as any);
      expect(component.orderBy()).toBe('invoiceNumber');
      expect(component.orderDir()).toBe('desc');
    });

    it('should not reload if same sort', () => {
      fixture.detectChanges();
      const callCount = (mockService.loadAll as ReturnType<typeof vi.fn>).mock.calls.length;
      component.onSort({ field: 'createdAt', order: -1 } as any);
      expect((mockService.loadAll as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callCount);
    });

    it('should clear filters', () => {
      fixture.detectChanges();
      component.selectedStatus.set('DRAFT');
      component.filterPaymentType.set('CASH');
      component.clearFilters();
      expect(component.selectedStatus()).toBe('');
      expect(component.filterPaymentType()).toBe('');
    });

    it('should update status filter', () => {
      fixture.detectChanges();
      component.onStatusFilterChange('DRAFT');
      expect(component.selectedStatus()).toBe('DRAFT');
    });

    it('should not reload if same status', () => {
      fixture.detectChanges();
      const callCount = (mockService.loadAll as ReturnType<typeof vi.fn>).mock.calls.length;
      component.onStatusFilterChange('');
      expect((mockService.loadAll as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callCount);
    });

    it('should update payment type filter', () => {
      fixture.detectChanges();
      component.onPaymentTypeFilterChange('CASH');
      expect(component.filterPaymentType()).toBe('CASH');
    });

    it('should update date filters', () => {
      fixture.detectChanges();
      const date = new Date('2025-01-01');
      component.onDateFromChange(date);
      expect(component.filterDateFrom()).toBe(date);
    });
  });

  describe('cancel dialog', () => {
    it('should open cancel dialog', () => {
      fixture.detectChanges();
      component.onCancelInvoice(mockInvoices[0]);
      expect(component.cancelDialogVisible()).toBe(true);
      expect(component.invoiceToCancel()).toEqual(mockInvoices[0]);
    });

    it('should call cancel service on dialog confirmed', () => {
      fixture.detectChanges();
      component.onCancelDialogConfirmed({ invoiceId: 'inv-001', reason: 'Test' });
      expect(mockService.cancel).toHaveBeenCalledWith('inv-001', 'Test');
    });

    it('should close dialog on dismissed', () => {
      fixture.detectChanges();
      component.cancelDialogVisible.set(true);
      component.onCancelDialogDismissed();
      expect(component.cancelDialogVisible()).toBe(false);
    });
  });

  describe('duplicate dialog', () => {
    it('should open duplicate dialog', () => {
      fixture.detectChanges();
      component.onDuplicate(mockInvoices[0]);
      expect(component.duplicateDialogVisible()).toBe(true);
      expect(component.invoiceToDuplicate()).toEqual(mockInvoices[0]);
    });

    it('should call duplicate service on dialog confirmed', () => {
      fixture.detectChanges();
      component.onDuplicateDialogConfirmed('inv-001');
      expect(mockService.duplicate).toHaveBeenCalledWith('inv-001');
    });

    it('should close dialog on dismissed', () => {
      fixture.detectChanges();
      component.duplicateDialogVisible.set(true);
      component.onDuplicateDialogDismissed();
      expect(component.duplicateDialogVisible()).toBe(false);
    });
  });

  describe('PDF download', () => {
    it('should open PDF viewer', () => {
      fixture.detectChanges();
      component.onDownloadPdf(mockInvoices[0]);
      expect(mockPdfViewer.open).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/api/reports/invoices/inv-001/pdf',
          title: 'Factura #FAC-001',
        })
      );
    });
  });

  describe('status helpers', () => {
    it('should get status label', () => {
      fixture.detectChanges();
      expect(component.getStatusLabel(InvoiceStatus.DRAFT)).toBe('Borrador');
    });

    it('should get payment type label', () => {
      fixture.detectChanges();
      expect(component.getPaymentTypeLabel(PaymentType.CASH)).toBe('Contado');
    });

    it('should get status variant', () => {
      fixture.detectChanges();
      expect(component.getStatusVariant(InvoiceStatus.DRAFT)).toBe('label');
      expect(component.getStatusVariant(InvoiceStatus.PAID)).toBe('success');
      expect(component.getStatusVariant(InvoiceStatus.CANCELLED)).toBe('danger');
    });

    it('should check canCancel', () => {
      fixture.detectChanges();
      expect(component.canCancel(InvoiceStatus.DRAFT)).toBe(false);
      expect(component.canCancel(InvoiceStatus.CANCELLED)).toBe(false);
      expect(component.canCancel(InvoiceStatus.PAID)).toBe(false);
      expect(component.canCancel(InvoiceStatus.PENDING_PAYMENT)).toBe(true);
      expect(component.canCancel(InvoiceStatus.PARTIALLY_PAID)).toBe(true);
    });
  });
});
