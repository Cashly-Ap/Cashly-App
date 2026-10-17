import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ConfirmationService, MessageService, SortEvent } from 'primeng/api';
import { ProductsListPageComponent } from '@features/catalog/products/pages/products-list-page/products-list-page.component';
import { ProductApplicationService } from '@features/catalog/products/services/application/product-application.service';
import { CategoryApplicationService } from '@features/catalog/categories/services/application/category-application.service';
import { PriceTypeApplicationService } from '@features/catalog/price-types/services/application/price-type-application.service';
import { ProductList } from '@features/catalog/products/models/interfaces/product-list.interface';
import { CatalogPdfApiService } from '@features/catalog/products/reporting/services/api/catalog-pdf-api.service';
import { StockPdfApiService } from '@features/inventory/warehouses/reporting/services/api/stock-pdf-api.service';
import { MovementsPdfApiService } from '@features/inventory/warehouses/reporting/services/api/movements-pdf-api.service';
import { OrderPdfApiService } from '@features/reports/orders/services/api/order-pdf-api.service';
import { InvoicePdfApiService } from '@features/finance/billing/invoices/reporting/services/api/invoice-pdf-api.service';
import { QuotePdfApiService } from '@features/reports/quotes/services/api/quote-pdf-api.service';

describe('ProductsListPageComponent', () => {
  let component: ProductsListPageComponent;
  let fixture: ComponentFixture<ProductsListPageComponent>;
  let mockService: Partial<ProductApplicationService>;
  let mockCategoryService: Partial<CategoryApplicationService>;
  let mockPriceTypeService: Partial<PriceTypeApplicationService>;
  let router: Router;
  let messageService: MessageService;

  const mockProduct: ProductList = {
    id: 'prod-001',
    code: 'P001',
    name: 'Test Product',
    categoryId: 'cat-001',
    categoryName: 'Test Category',
    composite: false,
    active: true,
    purchasePrice: 60,
    productPrices: [{ priceTypeId: 'pt-001', price: 120 }],
    stockTotal: 50,
  };

  const pdfMocks = [
    { provide: CatalogPdfApiService, useValue: { downloadPdf: vi.fn() } },
    { provide: StockPdfApiService, useValue: { getPdf: vi.fn() } },
    { provide: MovementsPdfApiService, useValue: { getPdf: vi.fn() } },
    { provide: OrderPdfApiService, useValue: { downloadOrdersReportPdf: vi.fn() } },
    { provide: InvoicePdfApiService, useValue: { downloadInvoicesReportPdf: vi.fn() } },
    { provide: QuotePdfApiService, useValue: { downloadQuotesReportPdf: vi.fn() } },
  ];

  function configureTestBed(
    loadAllValue: any = of({
      content: [mockProduct],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
    }),
    toggleActiveValue: any = of({ ...mockProduct, active: false }),
    deleteValue: any = of(undefined),
  ) {
    mockService = {
      loadAll: vi.fn().mockReturnValue(loadAllValue),
      toggleActive: vi.fn().mockReturnValue(toggleActiveValue),
      delete: vi.fn().mockReturnValue(deleteValue),
      products: signal([mockProduct]),
      simpleProducts: signal([mockProduct]),
      currentProduct: signal(null),
      loading: signal(false),
      error: signal(null),
      totalElements: signal(1),
    };

    mockCategoryService = {
      loadAll: vi.fn().mockReturnValue(of({ content: [], totalElements: 0 })),
      categories: signal([{ id: 'cat-001', name: 'Test Category' }]),
    };

    mockPriceTypeService = {
      loadAll: vi.fn().mockReturnValue(of(undefined)),
      priceTypes: signal([{ id: 'pt-001', name: 'Retail', active: true }]),
    };

    TestBed.configureTestingModule({
      imports: [ProductsListPageComponent],
      providers: [
        provideRouter([]),
        { provide: ProductApplicationService, useValue: mockService },
        { provide: CategoryApplicationService, useValue: mockCategoryService },
        { provide: PriceTypeApplicationService, useValue: mockPriceTypeService },
        MessageService,
        ConfirmationService,
        ...pdfMocks,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.compileComponents();
  }

  function createComponent() {
    fixture = TestBed.createComponent(ProductsListPageComponent);
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

  it('should have default signal values', () => {
    expect(component.searchTerm()).toBe('');
    expect(component.first()).toBe(0);
    expect(component.rows()).toBe(10);
    expect(component.orderBy()).toBe('name');
    expect(component.orderDir()).toBe('asc');
    expect(component.filterActive()).toBe('true');
    expect(component.filterComposite()).toBe('');
    expect(component.filterCategoryId()).toBeNull();
  });

  it('should load categories and price types on init', () => {
    fixture.detectChanges();
    expect(mockCategoryService.loadAll).toHaveBeenCalledWith({ size: 1000 });
    expect(mockPriceTypeService.loadAll).toHaveBeenCalled();
    expect(mockService.loadAll).toHaveBeenCalled();
  });

  it('should set selectedPriceTypeId to first active price type on init', () => {
    fixture.detectChanges();
    expect(component.selectedPriceTypeId()).toBe('pt-001');
  });

  it('should show initial loading when loading and products are empty', () => {
    component.loading.set(true);
    component.products.set([]);
    expect(component.showInitialLoading()).toBe(true);
  });

  it('should not show initial loading when products exist', () => {
    component.loading.set(true);
    component.products.set([mockProduct]);
    expect(component.showInitialLoading()).toBe(false);
  });

  it('should detect empty database state', () => {
    component.loading.set(false);
    component.totalElements.set(0);
    component.filterActive.set('true');
    component.filterComposite.set('');
    component.filterCategoryId.set(null);
    component.searchTerm.set('');
    expect(component.isEmptyDatabase()).toBe(true);
  });

  it('should detect filtered results state', () => {
    component.loading.set(false);
    component.totalElements.set(0);
    component.filterActive.set('false');
    expect(component.hasFilteredResults()).toBe(true);
  });

  it('should count active filters', () => {
    component.filterActive.set('false');
    component.filterComposite.set('true');
    component.filterCategoryId.set('cat-001');
    expect(component.activeFilterCount()).toBe(3);
  });

  it('should generate category options', () => {
    const options = component.categoryOptions();
    expect(options).toContainEqual({ label: 'Todas las categorías', value: null });
    expect(options).toContainEqual({ label: 'Test Category', value: 'cat-001' });
  });

  it('should generate price type options from active types', () => {
    const options = component.priceTypeOptions();
    expect(options).toContainEqual({ label: 'Retail', value: 'pt-001' });
  });

  it('should return price for product with selected price type', () => {
    component.selectedPriceTypeId.set('pt-001');
    const price = component.getPriceForProduct(mockProduct);
    expect(price).toBe(120);
  });

  it('should return purchasePrice when no price type selected', () => {
    component.selectedPriceTypeId.set(null);
    const price = component.getPriceForProduct(mockProduct);
    expect(price).toBe(60);
  });

  it('should return purchasePrice when product has no matching price', () => {
    component.selectedPriceTypeId.set('nonexistent');
    const price = component.getPriceForProduct(mockProduct);
    expect(price).toBe(60);
  });

  it('should call loadWithFilters on onSearch', () => {
    component.onSearch('test');
    expect(component.searchTerm()).toBe('test');
    expect(component.first()).toBe(0);
    expect(mockService.loadAll).toHaveBeenCalled();
  });

  it('should call loadWithFilters on onPageChange', () => {
    component.onPageChange({ first: 20, rows: 10 });
    expect(component.first()).toBe(20);
    expect(component.rows()).toBe(10);
    expect(mockService.loadAll).toHaveBeenCalled();
  });

  it('should call loadWithFilters on onSort', () => {
    const sortEvent: SortEvent = { field: 'name', order: -1 };
    component.onSort(sortEvent);
    expect(component.orderBy()).toBe('name');
    expect(component.orderDir()).toBe('desc');
    expect(component.first()).toBe(0);
    expect(mockService.loadAll).toHaveBeenCalled();
  });

  it('should skip loadWithFilters on onSort if same field and direction', () => {
    (mockService.loadAll as ReturnType<typeof vi.fn>).mockClear();
    const sortEvent: SortEvent = { field: 'name', order: 1 };
    component.onSort(sortEvent);
    expect(mockService.loadAll).not.toHaveBeenCalled();
  });

  it('should call loadWithFilters on active filter change', () => {
    component.onActiveFilterChange('false');
    expect(component.filterActive()).toBe('false');
    expect(component.first()).toBe(0);
    expect(mockService.loadAll).toHaveBeenCalled();
  });

  it('should call loadWithFilters on composite filter change', () => {
    component.onCompositeFilterChange('true');
    expect(component.filterComposite()).toBe('true');
    expect(component.first()).toBe(0);
    expect(mockService.loadAll).toHaveBeenCalled();
  });

  it('should call loadWithFilters on category filter change', () => {
    component.onCategoryFilterChange('cat-001');
    expect(component.filterCategoryId()).toBe('cat-001');
    expect(component.first()).toBe(0);
    expect(mockService.loadAll).toHaveBeenCalled();
  });

  it('should clear filters and reload', () => {
    component.filterActive.set('false');
    component.filterComposite.set('true');
    component.filterCategoryId.set('cat-001');
    component.clearFilters();
    expect(component.filterActive()).toBe('true');
    expect(component.filterComposite()).toBe('');
    expect(component.filterCategoryId()).toBeNull();
    expect(component.first()).toBe(0);
    expect(mockService.loadAll).toHaveBeenCalled();
  });

  it('should navigate to new product on onCreate', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onCreate();
    expect(navigateSpy).toHaveBeenCalledWith(['/products', 'new']);
  });

  it('should navigate to product detail on onView', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onView(mockProduct);
    expect(navigateSpy).toHaveBeenCalledWith(['/products', 'prod-001']);
  });

  it('should navigate to product edit on onEdit', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onEdit(mockProduct);
    expect(navigateSpy).toHaveBeenCalledWith(['/products', 'prod-001', 'edit']);
  });

  it('should show success message on toggleActive success', () => {
    const addSpy = vi.spyOn(messageService, 'add');
    component.onToggleActive(mockProduct);
    expect(mockService.toggleActive).toHaveBeenCalledWith('prod-001', false);
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Producto desactivado exitosamente',
      life: 3000,
    });
  });

  it('should show error message on toggleActive failure', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed(
      of({ content: [mockProduct], totalElements: 1, totalPages: 1, size: 10, number: 0 }),
      throwError(() => new Error('Failed')),
    );
    createComponent();

    const addSpy = vi.spyOn(messageService, 'add');
    fixture.detectChanges();
    component.onToggleActive(mockProduct);
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al cambiar el estado del producto.',
      life: 5000,
    });
  });

  it('should call confirmationService.confirm on onDelete', () => {
    const confirmSpy = vi.spyOn(component['confirmationService'], 'confirm');
    component.onDelete(mockProduct);
    expect(confirmSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Test Product'),
        header: 'Confirmar Eliminación',
      }),
    );
  });
});
