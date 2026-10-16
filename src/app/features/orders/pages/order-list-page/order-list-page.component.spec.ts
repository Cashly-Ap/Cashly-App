import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { Component, signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { OrderListPageComponent } from '@features/orders/pages/order-list-page/order-list-page.component';
import { OrderApplicationService } from '@features/orders/services/application/order-application.service';
import { OrderStatus } from '@features/orders/models/enums/order-status.enum';
import { OrderList } from '@features/orders/models/interfaces';
import { OrderPdfApiService } from '@features/reports/orders/services/api/order-pdf-api.service';
import { PdfViewerService } from '@core/pdf-viewer';

describe('OrderListPageComponent', () => {
  let component: OrderListPageComponent;
  let fixture: ComponentFixture<OrderListPageComponent>;
  let mockService: Partial<OrderApplicationService>;
  let router: Router;
  let messageService: MessageService;
  let httpMock: HttpTestingController;

  const mockOrders: OrderList[] = [
    {
      id: 'ord-001',
      orderNumber: 'ORD-001',
      customerAlias: 'Test Customer',
      customerId: 'c1',
      status: OrderStatus.DRAFT,
      totalAmount: 500,
      createdAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'ord-002',
      orderNumber: 'ORD-002',
      customerAlias: 'Customer B',
      customerId: 'c2',
      status: OrderStatus.CONFIRMED,
      totalAmount: 1000,
      createdAt: '2025-01-02T00:00:00Z',
    },
  ];

  const mockPdfApi = {
    downloadPdf: vi.fn(),
  };

  const mockPdfViewer = {
    open: vi.fn(),
  };

  function configureTestBed(loadAllValue: any = of(mockOrders)) {
    mockService = {
      loadAll: vi.fn().mockReturnValue(loadAllValue),
      loadById: vi.fn().mockReturnValue(of({})),
      create: vi.fn().mockReturnValue(of({})),
      update: vi.fn().mockReturnValue(of({})),
      delete: vi.fn().mockReturnValue(of(undefined)),
      confirm: vi.fn().mockReturnValue(of({})),
      cancel: vi.fn().mockReturnValue(of({})),
      convertToInvoice: vi.fn().mockReturnValue(of({})),
      orders: signal(mockOrders),
      currentOrder: signal(null),
      loading: signal(false),
      error: signal(null),
      totalElements: signal(2),
    };

    TestBed.configureTestingModule({
      imports: [OrderListPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => null }, queryParamMap: { get: () => null } },
          },
        },
        { provide: OrderApplicationService, useValue: mockService },
        { provide: OrderPdfApiService, useValue: mockPdfApi },
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
    fixture = TestBed.createComponent(OrderListPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    messageService = TestBed.inject(MessageService);
    httpMock = TestBed.inject(HttpTestingController);
  }

  beforeEach(() => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed();
    createComponent();
  });

  afterEach(() => {
    if (httpMock) {
      httpMock.match(() => true).forEach((req) => req.flush([]));
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load orders on init', () => {
    fixture.detectChanges();
    expect(mockService.loadAll).toHaveBeenCalled();
  });

  it('should have default signal values', () => {
    expect(component.searchTerm()).toBe('');
    expect(component.first()).toBe(0);
    expect(component.rows()).toBe(10);
    expect(component.filterStatus()).toBe('');
    expect(component.orderBy()).toBe('createdAt');
    expect(component.orderDir()).toBe('desc');
  });

  describe('computed signals', () => {
    it('should show initial loading when loading and no orders', () => {
      (mockService.loading as ReturnType<typeof signal>).set(true);
      (mockService.orders as ReturnType<typeof signal>).set([]);
      expect(component.showInitialLoading()).toBe(true);
    });

    it('should not show initial loading when orders exist', () => {
      (mockService.loading as ReturnType<typeof signal>).set(true);
      (mockService.orders as ReturnType<typeof signal>).set(mockOrders);
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

    it('should compute active filter count', () => {
      component.filterStatus.set('DRAFT');
      expect(component.activeFilterCount()).toBe(1);
    });

    it('should compute zero active filter count when no filters', () => {
      component.filterStatus.set('');
      expect(component.activeFilterCount()).toBe(0);
    });
  });

  it('should omit warehouse reassignment for draft orders', () => {
    const actions = component.actionsFor(mockOrders[0]).map((action) => action.label);

    expect(actions).not.toContain('Asignar almacenes');
  });

  describe('navigation', () => {
    it('should navigate to /orders/new on create', () => {
      fixture.detectChanges();
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onCreate();
      expect(navigateSpy).toHaveBeenCalledWith(['/orders/new']);
    });

    it('should navigate to /pedidos/{id} on view', () => {
      fixture.detectChanges();
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onView(mockOrders[0]);
      expect(navigateSpy).toHaveBeenCalledWith(['/orders', 'ord-001']);
    });

    it('should navigate to /orders/{id}/edit on edit', () => {
      fixture.detectChanges();
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onEdit(mockOrders[0]);
      expect(navigateSpy).toHaveBeenCalledWith(['/orders', 'ord-001', 'edit']);
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
      component.onSort({ field: 'orderNumber', order: -1 } as SortEvent);
      expect(component.orderBy()).toBe('orderNumber');
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
      component.filterStatus.set('DRAFT');
      component.clearFilters();
      expect(component.filterStatus()).toBe('');
      expect(component.first()).toBe(0);
    });

    it('should update status filter', () => {
      fixture.detectChanges();
      component.onStatusFilterChange('DRAFT');
      expect(component.filterStatus()).toBe('DRAFT');
    });

    it('should not reload if same status', () => {
      fixture.detectChanges();
      const callCount = (mockService.loadAll as ReturnType<typeof vi.fn>).mock.calls.length;
      component.onStatusFilterChange('');
      expect((mockService.loadAll as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callCount);
    });

    it('should normalize null status to empty string', () => {
      fixture.detectChanges();
      component.onStatusFilterChange(null);
      expect(component.filterStatus()).toBe('');
    });
  });

  describe('cancel dialog', () => {
    it('should open cancel dialog', () => {
      fixture.detectChanges();
      component.onCancelOrder(mockOrders[0]);
      expect(component.cancelDialogVisible()).toBe(true);
      expect(component.orderToCancel()).toEqual(mockOrders[0]);
    });

    it('should call cancel service on dialog confirmed', () => {
      fixture.detectChanges();
      component.onCancelDialogConfirmed({ orderId: 'ord-001', reason: 'Test' });
      expect(mockService.cancel).toHaveBeenCalledWith('ord-001', 'Test');
    });

    it('should close dialog on dismissed', () => {
      fixture.detectChanges();
      component.cancelDialogVisible.set(true);
      component.onCancelDialogDismissed();
      expect(component.cancelDialogVisible()).toBe(false);
      expect(component.orderToCancel()).toBeNull();
    });
  });

  describe('convert to invoice dialog', () => {
    it('should open invoice dialog', () => {
      fixture.detectChanges();
      component.onConvertToInvoice(mockOrders[0]);
      expect(component.invoiceDialogVisible()).toBe(true);
      expect(component.orderToInvoice()).toEqual(mockOrders[0]);
    });

    it('should close dialog on dismissed', () => {
      fixture.detectChanges();
      component.invoiceDialogVisible.set(true);
      component.onInvoiceDialogDismissed();
      expect(component.invoiceDialogVisible()).toBe(false);
      expect(component.orderToInvoice()).toBeNull();
    });

    it('should call convertToInvoice service on dialog confirmed', () => {
      fixture.detectChanges();
      component.orderToInvoice.set(mockOrders[0]);
      component.onInvoiceDialogConfirmed({ paymentType: 'CASH' });
      expect(mockService.convertToInvoice).toHaveBeenCalledWith('ord-001', { paymentType: 'CASH' });
    });

    it('should show success message on convert to invoice success', () => {
      fixture.detectChanges();
      component.orderToInvoice.set(mockOrders[0]);
      const addSpy = vi.spyOn(messageService, 'add');
      component.onInvoiceDialogConfirmed({ paymentType: 'CASH' });
      expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    });
  });

  describe('PDF download', () => {
    it('should open PDF viewer', () => {
      fixture.detectChanges();
      component.onDownloadPdf(mockOrders[0]);
      expect(mockPdfViewer.open).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/api/reports/orders/ord-001/pdf',
          title: 'Pedido #ORD-001',
          fileName: 'pedido-ORD-001.pdf',
        }),
      );
    });
  });

  describe('status helpers', () => {
    it('should get status label', () => {
      fixture.detectChanges();
      expect(component.getStatusLabel(OrderStatus.DRAFT)).toBe('Borrador');
      expect(component.getStatusLabel(OrderStatus.CONFIRMED)).toBe('Confirmado');
      expect(component.getStatusLabel(OrderStatus.CANCELLED)).toBe('Cancelado');
      expect(component.getStatusLabel(OrderStatus.INVOICED)).toBe('Facturado');
    });

    it('should get status variant', () => {
      fixture.detectChanges();
      expect(component.getStatusVariant(OrderStatus.DRAFT)).toBe('label');
      expect(component.getStatusVariant(OrderStatus.CONFIRMED)).toBe('info');
      expect(component.getStatusVariant(OrderStatus.CANCELLED)).toBe('danger');
      expect(component.getStatusVariant(OrderStatus.INVOICED)).toBe('success');
    });
  });

  describe('status options', () => {
    it('should have status options including "Todos"', () => {
      fixture.detectChanges();
      expect(component.statusOptions.length).toBeGreaterThan(0);
      expect(component.statusOptions[0].label).toBe('Todos los borradores');
      expect(component.statusOptions[0].value).toBe('');
    });
  });
});
