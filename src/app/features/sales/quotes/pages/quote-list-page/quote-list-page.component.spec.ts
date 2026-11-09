import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { QuoteListPageComponent } from '@features/sales/quotes/pages/quote-list-page/quote-list-page.component';
import { QuoteApplicationService } from '@features/sales/quotes/services/application/quote-application.service';
import { QuoteStatus } from '@features/sales/quotes/models/enums/quote-status.enum';
import { QuoteList } from '@features/sales/quotes/models/interfaces/quote-list.interface';
import { PdfViewerService } from '@core/pdf-viewer';

describe('QuoteListPageComponent', () => {
  let component: QuoteListPageComponent;
  let fixture: ComponentFixture<QuoteListPageComponent>;
  const queryParams = new BehaviorSubject(convertToParamMap({}));
  let mockService: Partial<QuoteApplicationService>;
  let router: Router;
  let messageService: MessageService;
  let httpMock: HttpTestingController;

  const mockQuotes: QuoteList[] = [
    {
      id: 'q-001',
      quoteNumber: 'QT-001',
      customerName: 'Test Customer',
      customerRif: 'J-12345678-9',
      status: QuoteStatus.DRAFT,
      subtotal: 500,
      expiryDate: '2025-12-31',
      createdBy: 'user-001',
      createdByName: 'John Doe',
      createdAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'q-002',
      quoteNumber: 'QT-002',
      customerName: 'Customer B',
      customerRif: 'J-98765432-1',
      status: QuoteStatus.CONVERTED_TO_ORDER,
      subtotal: 1000,
      expiryDate: '2025-12-31',
      createdBy: null,
      createdByName: null,
      createdAt: '2025-01-02T00:00:00Z',
    },
  ];

  const mockPdfViewer = {
    open: vi.fn(),
  };

  function configureTestBed(loadAllValue: any = of(mockQuotes)) {
    mockService = {
      loadAll: vi.fn().mockReturnValue(loadAllValue),
      loadById: vi.fn().mockReturnValue(of({})),
      create: vi.fn().mockReturnValue(of({})),
      update: vi.fn().mockReturnValue(of({})),
      delete: vi.fn().mockReturnValue(of(undefined)),
      convertToOrder: vi.fn().mockReturnValue(of({})),
      convertToInvoice: vi.fn().mockReturnValue(of({})),
      quotes: signal(mockQuotes),
      currentQuote: signal(null),
      loading: signal(false),
      error: signal(null),
      totalElements: signal(2),
    };

    TestBed.configureTestingModule({
      imports: [QuoteListPageComponent],
      providers: [
        { provide: AuthorizationService, useValue: { can: () => true } },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => null }, queryParamMap: { get: () => null } },
            queryParamMap: queryParams,
          },
        },
        { provide: QuoteApplicationService, useValue: mockService },
        { provide: PdfViewerService, useValue: mockPdfViewer },
        ConfirmationService,
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.compileComponents();
  }

  function createComponent() {
    fixture = TestBed.createComponent(QuoteListPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    messageService = TestBed.inject(MessageService);
    httpMock = TestBed.inject(HttpTestingController);
  }

  beforeEach(() => {
    (TestBed as TestBedStatic).resetTestingModule();
    queryParams.next(convertToParamMap({}));
    configureTestBed();
    createComponent();
  });

  afterEach(() => {
    if (httpMock) {
      httpMock.match(() => true).forEach((req) => req.flush([]));
    }
  });

  it.each([
    ['Editar', 'EDIT'],
    ['Convertir a pedido', 'CONVERT_TO_ORDER'],
    ['Convertir a factura', 'CONVERT_TO_INVOICE'],
  ])(
    'requests only eligible records for %s and keeps the action when searching',
    async (label, action) => {
      queryParams.next(convertToParamMap({ navAction: label }));
      await Promise.resolve();
      expect(mockService.loadAll).toHaveBeenLastCalledWith({
        action,
        orderBy: 'createdAt',
        orderDir: 'desc',
      });
      component.onSearch('document');
      expect(mockService.loadAll).toHaveBeenLastCalledWith({
        action,
        search: 'document',
        orderBy: 'createdAt',
        orderDir: 'desc',
      });
      queryParams.next(convertToParamMap({}));
      expect(mockService.loadAll).toHaveBeenLastCalledWith(expect.not.objectContaining({ action }));
    },
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load quotes on init', () => {
    fixture.detectChanges();
    expect(mockService.loadAll).toHaveBeenCalled();
  });

  it('should have default signal values', () => {
    expect(component.searchTerm()).toBe('');
    expect(component.first()).toBe(0);
    expect(component.rows()).toBe(10);
    expect(component.filterStatus()).toBe('DRAFT');
    expect(component.orderBy()).toBe('createdAt');
    expect(component.orderDir()).toBe('desc');
  });

  describe('computed signals', () => {
    it('should show initial loading when loading and no quotes', () => {
      (mockService.loading as ReturnType<typeof signal>).set(true);
      (mockService.quotes as ReturnType<typeof signal>).set([]);
      expect(component.showInitialLoading()).toBe(true);
    });

    it('should not show initial loading when quotes exist', () => {
      (mockService.loading as ReturnType<typeof signal>).set(true);
      (mockService.quotes as ReturnType<typeof signal>).set(mockQuotes);
      expect(component.showInitialLoading()).toBe(false);
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

    it('should compute active filter count when status is not DRAFT', () => {
      component.filterStatus.set('CONVERTED_TO_ORDER');
      expect(component.activeFilterCount()).toBe(1);
    });

    it('should not count the default DRAFT status as an active filter', () => {
      component.filterStatus.set('DRAFT');
      expect(component.activeFilterCount()).toBe(0);
    });
  });

  describe('navigation', () => {
    it('should navigate to /budgets/new on create', () => {
      fixture.detectChanges();
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onCreate();
      expect(navigateSpy).toHaveBeenCalledWith(['/sales/quotes/new']);
    });

    it('should navigate to /presupuestos/{id} on view', () => {
      fixture.detectChanges();
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onView(mockQuotes[0]);
      expect(navigateSpy).toHaveBeenCalledWith(['/sales/quotes', 'q-001']);
    });

    it('should navigate to /quotes/{id}/edit on edit', () => {
      fixture.detectChanges();
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onEdit(mockQuotes[0]);
      expect(navigateSpy).toHaveBeenCalledWith(['/sales/quotes', 'q-001', 'edit']);
    });
  });

  describe('filtering and pagination', () => {
    it('should update searchTerm and reload on search', () => {
      fixture.detectChanges();
      component.onSearch('test');
      expect(component.searchTerm()).toBe('test');
      expect(component.first()).toBe(0);
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
      component.onSort({ field: 'quoteNumber', order: -1 } as SortEvent);
      expect(component.orderBy()).toBe('quoteNumber');
      expect(component.orderDir()).toBe('desc');
    });

    it('should not reload if same sort', () => {
      fixture.detectChanges();
      const callCount = (mockService.loadAll as ReturnType<typeof vi.fn>).mock.calls.length;
      component.onSort({ field: 'createdAt', order: -1 } as SortEvent);
      expect((mockService.loadAll as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callCount);
    });

    it('should clear filters', () => {
      fixture.detectChanges();
      component.filterStatus.set('CONVERTED_TO_ORDER');
      component.clearFilters();
      expect(component.filterStatus()).toBe('DRAFT');
      expect(component.first()).toBe(0);
    });

    it('should update status filter', () => {
      fixture.detectChanges();
      component.onStatusFilterChange('CONVERTED_TO_ORDER');
      expect(component.filterStatus()).toBe('CONVERTED_TO_ORDER');
    });

    it('should not reload if same status', () => {
      fixture.detectChanges();
      component.onStatusFilterChange('DRAFT');
      const callCount = (mockService.loadAll as ReturnType<typeof vi.fn>).mock.calls.length;
      component.onStatusFilterChange('DRAFT');
      expect((mockService.loadAll as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callCount);
    });
  });

  describe('convert to order dialog', () => {
    it('should open order dialog', () => {
      fixture.detectChanges();
      component.onConvertToOrder(mockQuotes[0]);
      expect(component.orderDialogVisible()).toBe(true);
      expect(component.quoteToConvertToOrder()).toEqual(mockQuotes[0]);
    });

    it('should close dialog on dismissed', () => {
      fixture.detectChanges();
      component.orderDialogVisible.set(true);
      component.onOrderDialogDismissed();
      expect(component.orderDialogVisible()).toBe(false);
      expect(component.quoteToConvertToOrder()).toBeNull();
    });

    it('should call convertToOrder service on dialog confirmed', () => {
      fixture.detectChanges();
      component.quoteToConvertToOrder.set(mockQuotes[0]);
      component.onOrderDialogConfirmed();
      expect(mockService.convertToOrder).toHaveBeenCalledWith('q-001');
    });

    it('should show success message on convert to order success', () => {
      fixture.detectChanges();
      component.quoteToConvertToOrder.set(mockQuotes[0]);
      const addSpy = vi.spyOn(messageService, 'add');
      component.onOrderDialogConfirmed();
      expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    });

    it('should show error on convert to order failure', () => {
      (TestBed as TestBedStatic).resetTestingModule();
      const errorMockService = {
        loadAll: vi.fn().mockReturnValue(of(mockQuotes)),
        loadById: vi.fn().mockReturnValue(of({})),
        create: vi.fn().mockReturnValue(of({})),
        update: vi.fn().mockReturnValue(of({})),
        delete: vi.fn().mockReturnValue(of(undefined)),
        convertToOrder: vi.fn().mockReturnValue(throwError(() => new Error('Fail'))),
        convertToInvoice: vi.fn().mockReturnValue(of({})),
        quotes: signal(mockQuotes),
        currentQuote: signal(null),
        loading: signal(false),
        error: signal(null),
        totalElements: signal(2),
      };
      TestBed.configureTestingModule({
        imports: [QuoteListPageComponent],
        providers: [
          provideRouter([]),
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: { paramMap: { get: () => null }, queryParamMap: { get: () => null } },
              queryParamMap: queryParams,
            },
          },
          { provide: QuoteApplicationService, useValue: errorMockService },
          { provide: PdfViewerService, useValue: mockPdfViewer },
          ConfirmationService,
          MessageService,
          provideHttpClient(),
          provideHttpClientTesting(),
        ],
        schemas: [NO_ERRORS_SCHEMA],
      });
      TestBed.compileComponents();
      fixture = TestBed.createComponent(QuoteListPageComponent);
      component = fixture.componentInstance;
      messageService = TestBed.inject(MessageService);
      httpMock = TestBed.inject(HttpTestingController);
      fixture.detectChanges();
      component.quoteToConvertToOrder.set(mockQuotes[0]);
      const addSpy = vi.spyOn(messageService, 'add');
      component.onOrderDialogConfirmed();
      expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });
  });

  describe('convert to invoice dialog', () => {
    it('should open invoice dialog', () => {
      fixture.detectChanges();
      component.onConvertToInvoice(mockQuotes[0]);
      expect(component.invoiceDialogVisible()).toBe(true);
      expect(component.quoteToConvertToInvoice()).toEqual(mockQuotes[0]);
    });

    it('should close dialog on dismissed', () => {
      fixture.detectChanges();
      component.invoiceDialogVisible.set(true);
      component.onInvoiceDialogDismissed();
      expect(component.invoiceDialogVisible()).toBe(false);
      expect(component.quoteToConvertToInvoice()).toBeNull();
    });

    it('should call convertToInvoice service on dialog confirmed', () => {
      fixture.detectChanges();
      component.quoteToConvertToInvoice.set(mockQuotes[0]);
      component.onInvoiceDialogConfirmed({ paymentType: 'CASH' });
      expect(mockService.convertToInvoice).toHaveBeenCalledWith('q-001', { paymentType: 'CASH' });
    });

    it('should show success message on convert to invoice success', () => {
      fixture.detectChanges();
      component.quoteToConvertToInvoice.set(mockQuotes[0]);
      const addSpy = vi.spyOn(messageService, 'add');
      component.onInvoiceDialogConfirmed({ paymentType: 'CASH' });
      expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    });
  });

  it('should keep direct conversions and omit warehouse reassignment for drafts', () => {
    const actions = component.actionsFor(mockQuotes[0]);
    expect(actions.map((action) => action.label)).not.toContain('Asignar almacenes');
    actions.find((action) => action.label === 'Convertir a pedido')?.command();
    expect(component.orderDialogVisible()).toBe(true);
    expect(component.quoteToConvertToOrder()).toEqual(mockQuotes[0]);
    actions.find((action) => action.label === 'Convertir a factura')?.command();
    expect(component.invoiceDialogVisible()).toBe(true);
  });

  it('should show the conversion conflict returned by the backend', () => {
    const message = 'Stock insuficiente para convertir el presupuesto';
    vi.mocked(mockService.convertToInvoice!).mockReturnValue(
      throwError(() => ({ status: 409, error: { message } })),
    );
    component.quoteToConvertToInvoice.set(mockQuotes[0]);
    const addSpy = vi.spyOn(messageService, 'add');
    component.onInvoiceDialogConfirmed({ paymentType: 'CASH' });
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ detail: message }));
  });

  describe('PDF download', () => {
    it('should open PDF viewer', () => {
      fixture.detectChanges();
      component.onDownloadPdf(mockQuotes[0]);
      expect(mockPdfViewer.open).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/api/reports/quotes/q-001/pdf',
          title: 'Presupuesto #QT-001',
          fileName: 'presupuesto-QT-001.pdf',
        }),
      );
    });
  });

  describe('status helpers', () => {
    it('should get status label', () => {
      fixture.detectChanges();
      expect(component.getStatusLabel(QuoteStatus.DRAFT)).toBe('Borrador');
      expect(component.getStatusLabel(QuoteStatus.CONVERTED_TO_ORDER)).toBe('Convertido a Pedido');
      expect(component.getStatusLabel(QuoteStatus.CONVERTED_TO_INVOICE)).toBe(
        'Convertido a Factura',
      );
      expect(component.getStatusLabel(QuoteStatus.CANCELLED)).toBe('Cancelado');
    });

    it('should get status variant', () => {
      fixture.detectChanges();
      expect(component.getStatusVariant(QuoteStatus.DRAFT)).toBe('label');
      expect(component.getStatusVariant(QuoteStatus.CANCELLED)).toBe('danger');
      expect(component.getStatusVariant(QuoteStatus.CONVERTED_TO_ORDER)).toBe('success');
      expect(component.getStatusVariant(QuoteStatus.CONVERTED_TO_INVOICE)).toBe('success');
    });
  });

  describe('status options', () => {
    it('should have status options including DRAFT', () => {
      fixture.detectChanges();
      expect(component.statusOptions.length).toBeGreaterThan(0);
      expect(component.statusOptions[0].label).toBe('Borrador');
      expect(component.statusOptions[0].value).toBe('DRAFT');
    });
  });
});
