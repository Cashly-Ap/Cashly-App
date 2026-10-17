import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ProductsDetailsPageComponent } from '@features/catalog/products/pages/products-details-page/products-details-page.component';
import { ProductApplicationService } from '@features/catalog/products/services/application/product-application.service';
import { ProductPhotoService } from '@features/catalog/products/services/api/product-photo.service';
import { ProductDetails } from '@features/catalog/products/models/interfaces/product-details.interface';
import { ProductStockByWarehouse } from '@features/catalog/products/models/interfaces/product-stock-by-warehouse.interface';
import { CatalogPdfApiService } from '@features/catalog/products/reporting/services/api/catalog-pdf-api.service';
import { StockPdfApiService } from '@features/inventory/warehouses/reporting/services/api/stock-pdf-api.service';
import { MovementsPdfApiService } from '@features/inventory/warehouses/reporting/services/api/movements-pdf-api.service';
import { OrderPdfApiService } from '@features/reports/orders/services/api/order-pdf-api.service';
import { InvoicePdfApiService } from '@features/finance/billing/invoices/reporting/services/api/invoice-pdf-api.service';
import { QuotePdfApiService } from '@features/reports/quotes/services/api/quote-pdf-api.service';

describe('ProductsDetailsPageComponent', () => {
  let component: ProductsDetailsPageComponent;
  let fixture: ComponentFixture<ProductsDetailsPageComponent>;
  let mockService: Partial<ProductApplicationService>;
  let mockPhotoService: Partial<ProductPhotoService>;
  let router: Router;
  let messageService: MessageService;

  const mockProduct: ProductDetails = {
    id: 'prod-001',
    code: 'P001',
    name: 'Test Product',
    categoryId: 'cat-001',
    categoryName: 'Test Category',
    composite: false,
    photo: null,
    active: true,
    description: 'Test description',
    purchasePrice: 80,
    components: [],
    productPrices: [
      {
        id: 'pp-001',
        priceTypeId: 'pt-001',
        priceTypeName: 'Retail',
        price: 120,
        profitMargin: 20,
      },
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  const mockStock: ProductStockByWarehouse[] = [
    {
      warehouseId: 'wh-001',
      warehouseName: 'Main Warehouse',
      quantity: 50,
      lastMovementAt: '2025-01-01T00:00:00Z',
    },
    {
      warehouseId: 'wh-002',
      warehouseName: 'Secondary Warehouse',
      quantity: 30,
      lastMovementAt: null,
    },
  ];

  const pdfMocks = [
    { provide: CatalogPdfApiService, useValue: { downloadPdf: vi.fn() } },
    { provide: StockPdfApiService, useValue: { getPdf: vi.fn() } },
    { provide: MovementsPdfApiService, useValue: { getPdf: vi.fn() } },
    { provide: OrderPdfApiService, useValue: { downloadOrdersReportPdf: vi.fn() } },
    { provide: InvoicePdfApiService, useValue: { downloadInvoicesReportPdf: vi.fn() } },
    { provide: QuotePdfApiService, useValue: { downloadQuotesReportPdf: vi.fn() } },
  ];

  function configureTestBed(
    id: string | null = 'prod-001',
    loadByIdValue: any = of(mockProduct),
    getStockValue: any = of(mockStock),
    toggleActiveValue: any = of({ ...mockProduct, active: false }),
  ) {
    mockService = {
      loadAll: vi.fn().mockReturnValue(of({ content: [], totalElements: 0 })),
      loadById: vi.fn().mockReturnValue(loadByIdValue),
      getStock: vi.fn().mockReturnValue(getStockValue),
      toggleActive: vi.fn().mockReturnValue(toggleActiveValue),
      products: signal([]),
      simpleProducts: signal([]),
      currentProduct: signal(null),
      loading: signal(false),
      error: signal(null),
      totalElements: signal(0),
    };

    mockPhotoService = {
      loadPhoto: vi.fn(),
      photoUrl: signal<string | null>(null),
    };

    TestBed.configureTestingModule({
      imports: [ProductsDetailsPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => id } } } },
        { provide: ProductApplicationService, useValue: mockService },
        { provide: ProductPhotoService, useValue: mockPhotoService },
        MessageService,
        ...pdfMocks,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.compileComponents();
  }

  function createComponent() {
    fixture = TestBed.createComponent(ProductsDetailsPageComponent);
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

  it('should have null product initially', () => {
    expect(component.product()).toBeNull();
  });

  it('should have empty stock initially', () => {
    expect(component.stockByWarehouse()).toEqual([]);
  });

  it('should not be loading initially', () => {
    expect(component.loading()).toBe(false);
  });

  it('should calculate totalStock from stockByWarehouse', () => {
    component.stockByWarehouse.set(mockStock);
    expect(component.totalStock()).toBe(80);
  });

  it('should calculate totalStock as 0 when stock is empty', () => {
    component.stockByWarehouse.set([]);
    expect(component.totalStock()).toBe(0);
  });

  it('should load product on init', () => {
    fixture.detectChanges();
    expect(mockService.loadById).toHaveBeenCalledWith('prod-001');
    expect(mockService.getStock).toHaveBeenCalledWith('prod-001');
  });

  it('should set product and stock on load success', () => {
    fixture.detectChanges();
    expect(component.product()?.id).toBe('prod-001');
    expect(component.product()?.name).toBe('Test Product');
    expect(component.stockByWarehouse().length).toBe(2);
  });

  it('should load photo on load success', () => {
    fixture.detectChanges();
    expect(mockPhotoService.loadPhoto).toHaveBeenCalledWith(null);
  });

  it('should set loading to false after load', () => {
    fixture.detectChanges();
    expect(component.loading()).toBe(false);
  });

  it('should show error message and navigate on load failure', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed(
      'prod-999',
      throwError(() => new Error('Not found')),
    );
    createComponent();

    const addSpy = vi.spyOn(messageService, 'add');
    const navigateSpy = vi.spyOn(router, 'navigate');

    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al cargar el producto.',
      life: 5000,
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/products']);
  });

  it('should handle getStock error gracefully', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed(
      'prod-001',
      of(mockProduct),
      throwError(() => new Error('Stock error')),
    );
    createComponent();
    fixture.detectChanges();

    expect(component.product()?.id).toBe('prod-001');
    expect(component.stockByWarehouse()).toEqual([]);
  });

  it('should not load product if id is null', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed(null);
    createComponent();
    fixture.detectChanges();

    expect(mockService.loadById).not.toHaveBeenCalled();
  });

  it('should navigate to /products/{id}/edit on onEdit', () => {
    component.product.set(mockProduct);
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onEdit();
    expect(navigateSpy).toHaveBeenCalledWith(['/products', 'prod-001', 'edit']);
  });

  it('should not navigate on onEdit if product is null', () => {
    component.product.set(null);
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onEdit();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should toggle active and update product on success', () => {
    component.product.set(mockProduct);
    const addSpy = vi.spyOn(messageService, 'add');
    component.onToggleActive();

    expect(mockService.toggleActive).toHaveBeenCalledWith('prod-001', false);
    expect(component.product()?.active).toBe(false);
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
      'prod-001',
      of(mockProduct),
      of(mockStock),
      throwError(() => new Error('Failed')),
    );
    createComponent();
    fixture.detectChanges();

    component.product.set(mockProduct);
    const addSpy = vi.spyOn(messageService, 'add');
    component.onToggleActive();

    expect(addSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al cambiar el estado.',
      life: 5000,
    });
  });

  it('should not toggle active if product is null', () => {
    component.product.set(null);
    component.onToggleActive();
    expect(mockService.toggleActive).not.toHaveBeenCalled();
  });

  it('should navigate to /products on onBack', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/products']);
  });
});
