import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InvoiceListPageComponent } from '@features/finance/billing/invoices/pages/invoice-list-page/invoice-list-page.component';
import { InvoiceApplicationService } from '@features/finance/billing/invoices/services/application/invoice-application.service';
import { InvoiceStatus } from '@features/finance/billing/invoices/models/enums/invoice-status.enum';
import { PaymentType } from '@features/finance/billing/invoices/models/enums/payment-type.enum';
import { PdfViewerService } from '@core/pdf-viewer';

describe('InvoiceListPageComponent', () => {
  let component: InvoiceListPageComponent;
  let fixture: ComponentFixture<InvoiceListPageComponent>;
  let mockService: Partial<InvoiceApplicationService>;
  let router: Router;
  let messageService: MessageService;
  const queryParams = new BehaviorSubject(convertToParamMap({}));

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
        { provide: AuthorizationService, useValue: { can: () => true } },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParams,
            snapshot: { paramMap: { get: () => null }, queryParamMap: { get: () => null } },
          },
        },
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
    queryParams.next(convertToParamMap({}));
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

  it('searches every invoice status from the navbar without retaining list filters', async () => {
    component.selectedStatus.set('DRAFT');
    component.filterDateFrom.set(new Date('2026-01-01'));
    component.filterPaymentType.set('CASH');
    queryParams.next(convertToParamMap({ navAction: 'Ver detalle' }));
    await Promise.resolve();
    expect(mockService.loadAll).toHaveBeenLastCalledWith({
      statuses: Object.values(InvoiceStatus),
      orderBy: 'createdAt',
      orderDir: 'desc',
    });
  });

  it('searches cancellable invoice states after a draft-only list filter', async () => {
    component.selectedStatus.set('DRAFT');
    queryParams.next(convertToParamMap({ navAction: 'Cancelar' }));
    await Promise.resolve();
    expect(component.selectedStatus()).toBe('ALL');
    expect(mockService.loadAll).toHaveBeenLastCalledWith({
      action: 'CANCEL',
      orderBy: 'createdAt',
      orderDir: 'desc',
    });
  });

  it.each([['Editar', 'EDIT'], ['Confirmar', 'CONFIRM'], ['Cancelar', 'CANCEL'], ['Duplicar', 'DUPLICATE']])('uses backend eligibility for %s and removes it after closing', async (label, action) => {
    queryParams.next(convertToParamMap({ navAction: label }));
    await Promise.resolve();
    expect(mockService.loadAll).toHaveBeenLastCalledWith({ action, orderBy: 'createdAt', orderDir: 'desc' });
    component.onSearch('FAC');
    expect(mockService.loadAll).toHaveBeenLastCalledWith({ action, search: 'FAC', orderBy: 'createdAt', orderDir: 'desc' });
    queryParams.next(convertToParamMap({}));
    expect(mockService.loadAll).toHaveBeenLastCalledWith(expect.not.objectContaining({ action }));
  });

  it('cancels outdated list requests before loading records for a new action', async () => {
    const cancelled = vi.fn();
    vi.mocked(mockService.loadAll!).mockReturnValueOnce(new Observable(() => cancelled));
    component.onSearch('old search');
    queryParams.next(convertToParamMap({ navAction: 'Confirmar' }));
    await Promise.resolve();
    expect(cancelled).toHaveBeenCalledOnce();
    expect(mockService.loadAll).toHaveBeenLastCalledWith({ action: 'CONFIRM', orderBy: 'createdAt', orderDir: 'desc' });
  });

  describe('navigation', () => {
    it('should navigate to /invoices/new on create', () => {
      fixture.detectChanges();
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onCreate();
      expect(navigateSpy).toHaveBeenCalledWith(['/finance/billing/invoices/new']);
    });

    it('should navigate to /facturas/{id} on view', () => {
      fixture.detectChanges();
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onView(mockInvoices[0]);
      expect(navigateSpy).toHaveBeenCalledWith(['/finance/billing/invoices', 'inv-001']);
    });

    it('should navigate to /invoices/{id}/edit on edit', () => {
      fixture.detectChanges();
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onEdit(mockInvoices[0]);
      expect(navigateSpy).toHaveBeenCalledWith(['/finance/billing/invoices', 'inv-001', 'edit']);
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
      component.onDuplicateDialogConfirmed({ invoiceId: 'inv-001' });
      expect(mockService.duplicate).toHaveBeenCalledWith('inv-001', undefined);
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
          title: 'Nota #FAC-001',
        }),
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
