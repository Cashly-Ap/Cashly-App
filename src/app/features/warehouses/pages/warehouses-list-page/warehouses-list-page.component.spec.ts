import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { WarehousesListPageComponent } from './warehouses-list-page.component';
import { WarehouseApplicationService } from '@features/warehouses/services/application';
import { ProductApplicationService } from '@features/products/services/application';
import { CategoryApplicationService } from '@features/categories/services/application/category-application.service';
import { WarehouseList, WarehouseStockItem, WarehouseDetails } from '@features/warehouses/models/interfaces';
import { ProductDetails } from '@features/products/models/interfaces';
import { CatalogPdfApiService } from '@features/reports/inventory/services/api/catalog-pdf-api.service';
import { StockPdfApiService } from '@features/reports/inventory/services/api/stock-pdf-api.service';
import { MovementsPdfApiService } from '@features/reports/inventory/services/api/movements-pdf-api.service';
import { OrderPdfApiService } from '@features/reports/orders/services/api/order-pdf-api.service';
import { InvoicePdfApiService } from '@features/reports/invoices/services/api/invoice-pdf-api.service';
import { QuotePdfApiService } from '@features/reports/quotes/services/api/quote-pdf-api.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

describe('WarehousesListPageComponent', () => {
  let component: WarehousesListPageComponent;
  let fixture: ComponentFixture<WarehousesListPageComponent>;
  let mockService: Partial<WarehouseApplicationService>;
  let mockProductService: Partial<ProductApplicationService>;
  let router: Router;
  let messageService: MessageService;
  let confirmationService: ConfirmationService;

  const mockWarehouses: WarehouseList[] = [
    { id: 'wh-001', name: 'Almacén Central', state: 'Distrito Capital', municipality: 'Libertador', active: true },
    { id: 'wh-002', name: 'Almacén Norte', state: 'Zulia', municipality: 'Maracaibo', active: false },
  ];

  const mockProducts = [
    { id: 'p1', name: 'Motor 10HP', composite: false },
    { id: 'p2', name: 'Kit Compuesto', composite: true },
  ];

  const mockStock: WarehouseStockItem[] = [
    { productId: 'p1', productName: 'Motor 10HP', unit: '', quantity: 50 },
  ];

  const pdfMocks = [
    { provide: CatalogPdfApiService, useValue: { downloadPdf: vi.fn() } },
    { provide: StockPdfApiService, useValue: { getPdf: vi.fn() } },
    { provide: MovementsPdfApiService, useValue: { getPdf: vi.fn() } },
    { provide: OrderPdfApiService, useValue: { downloadOrdersReportPdf: vi.fn() } },
    { provide: InvoicePdfApiService, useValue: { downloadInvoicesReportPdf: vi.fn() } },
    { provide: QuotePdfApiService, useValue: { downloadQuotesReportPdf: vi.fn() } },
  ];

  function configureTestBed(loadAllValue: any = of({ content: mockWarehouses, totalElements: 2, totalPages: 1, size: 10, number: 0 }), getStockValue: any = of(mockStock)) {
    mockService = {
      loadAll: vi.fn().mockReturnValue(loadAllValue),
      getStock: vi.fn().mockReturnValue(getStockValue),
      create: vi.fn().mockReturnValue(of({} as WarehouseDetails)),
      update: vi.fn().mockReturnValue(of({} as WarehouseDetails)),
      toggleActive: vi.fn().mockReturnValue(of({} as WarehouseDetails)),
      delete: vi.fn().mockReturnValue(of(undefined)),
      addEntry: vi.fn().mockReturnValue(of(undefined)),
      addExit: vi.fn().mockReturnValue(of(undefined)),
      loadSimpleWarehouses: vi.fn().mockReturnValue(of([])),
      warehouses: signal(mockWarehouses),
      simpleWarehouses: signal([]),
      currentWarehouse: signal(null),
      loading: signal(false),
      error: signal(null),
      totalElements: signal(2),
    };

    mockProductService = {
      simpleProducts: signal(mockProducts),
      loadSimpleProducts: vi.fn().mockReturnValue(of(mockProducts)),
      getById: vi.fn().mockReturnValue(of({ id: 'p2', name: 'Kit Compuesto', composite: true, components: [{ componentProductId: 'p1', componentProductName: 'Motor 10HP', quantity: 2 }] } as unknown as ProductDetails)),
    };

    TestBed.configureTestingModule({
      imports: [WarehousesListPageComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null }, queryParamMap: { get: () => null } } } },
        FormBuilder,
        { provide: WarehouseApplicationService, useValue: mockService },
        { provide: ProductApplicationService, useValue: mockProductService },
        { provide: CategoryApplicationService, useValue: { loadAll: vi.fn().mockReturnValue(of(undefined)), categories: signal([]) } },
        ConfirmationService,
        MessageService,
        ...pdfMocks,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.compileComponents();
  }

  function createComponent() {
    fixture = TestBed.createComponent(WarehousesListPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    messageService = TestBed.inject(MessageService);
    confirmationService = TestBed.inject(ConfirmationService);
  }

  beforeEach(() => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed();
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load warehouses on init', () => {
    fixture.detectChanges();
    expect(mockService.loadAll).toHaveBeenCalled();
  });

  it('should load simple products on init', () => {
    fixture.detectChanges();
    expect(mockProductService.loadSimpleProducts).toHaveBeenCalled();
  });

  describe('computed signals', () => {
    it('should show initial loading when loading and no warehouses', () => {
      (mockService.loading as ReturnType<typeof signal>).set(true);
      (mockService.warehouses as ReturnType<typeof signal>).set([]);
      expect(component.showInitialLoading()).toBe(true);
    });

    it('should not show initial loading when warehouses exist', () => {
      (mockService.loading as ReturnType<typeof signal>).set(true);
      expect(component.showInitialLoading()).toBe(false);
    });

    it('should detect empty database', () => {
      (mockService.loading as ReturnType<typeof signal>).set(false);
      (mockService.totalElements as ReturnType<typeof signal>).set(0);
      component.searchTerm.set('');
      component.filterActive.set('true');
      expect(component.isEmptyDatabase()).toBe(true);
    });

    it('should detect filtered results', () => {
      (mockService.loading as ReturnType<typeof signal>).set(false);
      (mockService.totalElements as ReturnType<typeof signal>).set(0);
      component.searchTerm.set('test');
      expect(component.hasFilteredResults()).toBe(true);
    });

    it('should compute active filter count', () => {
      component.filterActive.set('false');
      expect(component.activeFilterCount()).toBe(1);
    });
  });

  describe('product options', () => {
    it('should map products to options', () => {
      fixture.detectChanges();
      const options = component.productOptions();
      expect(options).toHaveLength(2);
      expect(options[1].label).toContain('[Compuesto]');
    });

    it('should filter exit product options by stock', () => {
      component.cachedStock.set(mockStock);
      fixture.detectChanges();
      const options = component.exitProductOptions();
      expect(options.length).toBeGreaterThan(0);
    });
  });

  describe('isProductComposite', () => {
    it('should return false for non-composite product', () => {
      fixture.detectChanges();
      expect(component.isProductComposite('p1')).toBe(false);
    });

    it('should return true for composite product', () => {
      fixture.detectChanges();
      expect(component.isProductComposite('p2')).toBe(true);
    });

    it('should return false for null productId', () => {
      expect(component.isProductComposite(null)).toBe(false);
    });
  });

  describe('stock calculations', () => {
    beforeEach(() => {
      component.cachedStock.set(mockStock);
    });

    it('should get current stock for product', () => {
      expect(component.getCurrentStock('p1')).toBe(50);
    });

    it('should return 0 for unknown product', () => {
      expect(component.getCurrentStock('unknown')).toBe(0);
    });

    it('should return 0 for null productId', () => {
      expect(component.getCurrentStock(null)).toBe(0);
    });

    it('should calculate resulting stock for entry', () => {
      expect(component.getResultingStock('p1', 10, true)).toBe(60);
    });

    it('should calculate resulting stock for exit', () => {
      expect(component.getResultingStock('p1', 10, false)).toBe(40);
    });

    it('should return current stock when quantity is null', () => {
      expect(component.getResultingStock('p1', null, true)).toBe(50);
    });
  });

  describe('entry form lines', () => {
    it('should start with one entry line', () => {
      fixture.detectChanges();
      expect(component.entryLines.length).toBe(1);
    });

    it('should add entry line', () => {
      fixture.detectChanges();
      component.addEntryLine();
      expect(component.entryLines.length).toBe(2);
    });

    it('should remove entry line when more than one', () => {
      fixture.detectChanges();
      component.addEntryLine();
      component.removeEntryLine(0);
      expect(component.entryLines.length).toBe(1);
    });

    it('should not remove last entry line', () => {
      fixture.detectChanges();
      component.removeEntryLine(0);
      expect(component.entryLines.length).toBe(1);
    });

    it('should calculate entry subtotal', () => {
      fixture.detectChanges();
      component.entryLines.at(0).patchValue({ quantity: 5, unitPrice: 100 });
      expect(component.getEntrySubtotal(0)).toBe(500);
    });
  });

  describe('exit form lines', () => {
    it('should start with one exit line', () => {
      fixture.detectChanges();
      expect(component.exitLines.length).toBe(1);
    });

    it('should add exit line', () => {
      fixture.detectChanges();
      component.addExitLine();
      expect(component.exitLines.length).toBe(2);
    });

    it('should remove exit line when more than one', () => {
      fixture.detectChanges();
      component.addExitLine();
      component.removeExitLine(0);
      expect(component.exitLines.length).toBe(1);
    });

    it('should not remove last exit line', () => {
      fixture.detectChanges();
      component.removeExitLine(0);
      expect(component.exitLines.length).toBe(1);
    });
  });

  describe('navigation', () => {
    it('should navigate to /warehouses/new on create', () => {
      fixture.detectChanges();
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onCreate();
      expect(navigateSpy).toHaveBeenCalledWith(['/warehouses', 'new']);
    });

    it('should navigate to /warehouses/{id} on view', () => {
      fixture.detectChanges();
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onView(mockWarehouses[0]);
      expect(navigateSpy).toHaveBeenCalledWith(['/warehouses', 'wh-001']);
    });

    it('should navigate to /warehouses/{id}/edit on edit', () => {
      fixture.detectChanges();
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onEdit(mockWarehouses[0]);
      expect(navigateSpy).toHaveBeenCalledWith(['/warehouses', 'wh-001', 'edit']);
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
      component.onSort({ field: 'name', order: -1 } as any);
      expect(component.orderBy()).toBe('name');
      expect(component.orderDir()).toBe('desc');
    });

    it('should not reload if same sort', () => {
      fixture.detectChanges();
      const callCount = (mockService.loadAll as ReturnType<typeof vi.fn>).mock.calls.length;
      component.onSort({ field: 'name', order: 1 } as any);
      expect((mockService.loadAll as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callCount);
    });

    it('should clear filters', () => {
      fixture.detectChanges();
      component.filterActive.set('false');
      component.clearFilters();
      expect(component.filterActive()).toBe('true');
    });
  });

  describe('entry dialog', () => {
    it('should open entry dialog and load stock', () => {
      fixture.detectChanges();
      component.onOpenEntry(mockWarehouses[0]);
      expect(component.showEntryDialog()).toBe(true);
      expect(component.selectedWarehouseId()).toBe('wh-001');
      expect(mockService.getStock).toHaveBeenCalledWith('wh-001');
    });

    it('should reset entry form when opening', () => {
      fixture.detectChanges();
      component.addEntryLine();
      component.onOpenEntry(mockWarehouses[0]);
      expect(component.entryLines.length).toBe(1);
    });

    it('should submit entry when form is valid', () => {
      fixture.detectChanges();
      component.selectedWarehouseId.set('wh-001');
      component.entryLines.at(0).patchValue({ productId: 'p1', quantity: 10 });
      component.onSubmitEntry();
      expect(mockService.addEntry).toHaveBeenCalledWith('wh-001', expect.any(Object));
    });

    it('should not submit entry when form is invalid', () => {
      fixture.detectChanges();
      component.selectedWarehouseId.set('wh-001');
      component.entryLines.at(0).patchValue({ productId: null, quantity: 10 });
      component.onSubmitEntry();
      expect(mockService.addEntry).not.toHaveBeenCalled();
    });

    it('should not submit entry when no warehouse selected', () => {
      fixture.detectChanges();
      component.selectedWarehouseId.set(null);
      component.onSubmitEntry();
      expect(mockService.addEntry).not.toHaveBeenCalled();
    });

    it('should show error on entry failure', () => {
      (mockService.addEntry as ReturnType<typeof vi.fn>).mockReturnValue(throwError(() => new Error('Fail')));

      fixture.detectChanges();
      component.selectedWarehouseId.set('wh-001');
      component.entryLines.at(0).patchValue({ productId: 'p1', quantity: 10 });

      const addSpy = vi.spyOn(messageService, 'add');
      component.onSubmitEntry();

      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error' })
      );
    });
  });

  describe('exit dialog', () => {
    it('should open exit dialog and load stock', () => {
      fixture.detectChanges();
      component.onOpenExit(mockWarehouses[0]);
      expect(component.showExitDialog()).toBe(true);
      expect(component.selectedWarehouseId()).toBe('wh-001');
    });

    it('should submit exit when form is valid', () => {
      fixture.detectChanges();
      component.selectedWarehouseId.set('wh-001');
      component.exitLines.at(0).patchValue({ productId: 'p1', quantity: 5 });
      component.onSubmitExit();
      expect(mockService.addExit).toHaveBeenCalledWith('wh-001', expect.any(Object));
    });

    it('should not submit exit when form is invalid', () => {
      fixture.detectChanges();
      component.selectedWarehouseId.set('wh-001');
      component.exitLines.at(0).patchValue({ productId: null, quantity: 5 });
      component.onSubmitExit();
      expect(mockService.addExit).not.toHaveBeenCalled();
    });
  });

  describe('toggleActive', () => {
    it('should call toggleActive service', () => {
      fixture.detectChanges();
      component.onToggleActive(mockWarehouses[0]);
      expect(mockService.toggleActive).toHaveBeenCalledWith('wh-001', false);
    });

    it('should show success message on toggle', () => {
      fixture.detectChanges();
      const addSpy = vi.spyOn(messageService, 'add');
      component.onToggleActive(mockWarehouses[0]);
      expect(addSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success' })
      );
    });
  });

  describe('getComponentStockImpact', () => {
    beforeEach(() => {
      component.cachedStock.set(mockStock);
    });

    it('should return empty for non-composite product', () => {
      fixture.detectChanges();
      const impact = component.getComponentStockImpact('p1', 5);
      expect(impact).toEqual([]);
    });

    it('should return empty for null productId', () => {
      expect(component.getComponentStockImpact(null, 5)).toEqual([]);
    });

    it('should return empty for null quantity', () => {
      expect(component.getComponentStockImpact('p2', null)).toEqual([]);
    });

    it('should calculate stock impact for composite product', () => {
      fixture.detectChanges();
      component.onEntryProductSelected('p2');
      const impact = component.getComponentStockImpact('p2', 2);
      expect(impact.length).toBe(1);
      expect(impact[0].name).toBe('Motor 10HP');
      expect(impact[0].current).toBe(50);
      expect(impact[0].resulting).toBe(46);
    });
  });

  describe('onEntryProductSelected', () => {
    it('should not load details for non-composite product', () => {
      fixture.detectChanges();
      component.onEntryProductSelected('p1');
      expect(mockProductService.getById).not.toHaveBeenCalled();
    });

    it('should not load details if already cached', () => {
      fixture.detectChanges();
      component.compositeDetailsCache.set('p2', {} as ProductDetails);
      component.onEntryProductSelected('p2');
      expect(mockProductService.getById).not.toHaveBeenCalled();
    });
  });
});
