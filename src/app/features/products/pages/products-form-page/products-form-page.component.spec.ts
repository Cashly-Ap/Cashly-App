import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ProductsFormPageComponent } from './products-form-page.component';
import { ProductApplicationService } from '@features/products/services/application';
import { ProductPhotoService } from '@features/products/services/api';
import { PriceTypeApplicationService } from '@features/price-types/services/application/price-type-application.service';
import { CategoryApplicationService } from '@features/categories/services/application/category-application.service';
import { ProductDetails } from '@features/products/models/interfaces';
import { PendingTabsService } from '@core/pending-tabs';
import { CatalogPdfApiService } from '@features/reports/inventory/services/api/catalog-pdf-api.service';
import { StockPdfApiService } from '@features/reports/inventory/services/api/stock-pdf-api.service';
import { MovementsPdfApiService } from '@features/reports/inventory/services/api/movements-pdf-api.service';
import { OrderPdfApiService } from '@features/reports/orders/services/api/order-pdf-api.service';
import { InvoicePdfApiService } from '@features/reports/invoices/services/api/invoice-pdf-api.service';
import { QuotePdfApiService } from '@features/reports/quotes/services/api/quote-pdf-api.service';

describe('ProductsFormPageComponent', () => {
  let component: ProductsFormPageComponent;
  let fixture: ComponentFixture<ProductsFormPageComponent>;
  let mockService: Partial<ProductApplicationService>;
  let mockPhotoService: Partial<ProductPhotoService>;
  let mockPriceTypeService: Partial<PriceTypeApplicationService>;
  let mockPendingTabsService: Partial<PendingTabsService>;
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
    productPrices: [{ id: 'pp-001', priceTypeId: 'pt-001', priceTypeName: 'Retail', price: 120 }],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  const pdfMocks = [
    { provide: CatalogPdfApiService, useValue: { downloadPdf: vi.fn() } },
    { provide: StockPdfApiService, useValue: { getPdf: vi.fn() } },
    { provide: MovementsPdfApiService, useValue: { getPdf: vi.fn() } },
    { provide: OrderPdfApiService, useValue: { downloadOrdersReportPdf: vi.fn() } },
    { provide: InvoicePdfApiService, useValue: { downloadInvoicesReportPdf: vi.fn() } },
    { provide: QuotePdfApiService, useValue: { downloadQuotesReportPdf: vi.fn() } },
  ];

  function createMockActivatedRoute(id: string | null = null) {
    return {
      paramMap: of({ get: () => id }),
      snapshot: { paramMap: { get: () => id }, queryParamMap: { get: () => null } },
    };
  }

  function configureTestBed(
    id: string | null = null,
    loadByIdValue: any = of(mockProduct),
    createValue: any = of(mockProduct),
    updateValue: any = of(mockProduct),
  ) {
    mockService = {
      loadAll: vi.fn().mockReturnValue(of({ content: [], totalElements: 0 })),
      loadById: vi.fn().mockReturnValue(loadByIdValue),
      create: vi.fn().mockReturnValue(createValue),
      update: vi.fn().mockReturnValue(updateValue),
      toggleActive: vi.fn().mockReturnValue(of(mockProduct)),
      delete: vi.fn().mockReturnValue(of(undefined)),
      products: signal([]),
      simpleProducts: signal([]),
      currentProduct: signal(null),
      loading: signal(false),
      error: signal(null),
      totalElements: signal(0),
    };

    mockPhotoService = {
      loadPhoto: vi.fn(),
      deletePhoto: vi.fn().mockReturnValue(of(undefined)),
      uploadPhoto: vi.fn().mockReturnValue(of(undefined)),
      clearPhoto: vi.fn(),
      photoUrl: signal<string | null>(null),
    };

    mockPriceTypeService = {
      loadAll: vi.fn().mockReturnValue(of(undefined)),
      priceTypes: signal([{ id: 'pt-001', name: 'Retail', active: true }]),
    };

    mockPendingTabsService = {
      get: vi.fn().mockReturnValue(null),
      save: vi.fn(),
      remove: vi.fn(),
      allTabs: signal([]),
      tabCount: signal(0),
      hasTabs: signal(false),
    };

    TestBed.configureTestingModule({
      imports: [ProductsFormPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: createMockActivatedRoute(id) },
        { provide: ProductApplicationService, useValue: mockService },
        { provide: ProductPhotoService, useValue: mockPhotoService },
        { provide: PriceTypeApplicationService, useValue: mockPriceTypeService },
        { provide: PendingTabsService, useValue: mockPendingTabsService },
        {
          provide: CategoryApplicationService,
          useValue: { loadAll: vi.fn().mockReturnValue(of(undefined)), categories: signal([]) },
        },
        MessageService,
        ...pdfMocks,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.compileComponents();
  }

  function createComponent() {
    fixture = TestBed.createComponent(ProductsFormPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    messageService = TestBed.inject(MessageService);
    fixture.detectChanges();
  }

  beforeEach(() => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed();
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be in create mode when no id', () => {
    expect(component.isCreateMode()).toBe(true);
    expect(component.isEditMode()).toBe(false);
  });

  it('should have correct form config', () => {
    const config = component.getConfig();
    expect(config.entityDisplayName).toBe('Producto');
    expect(config.entityArticle).toBe('del');
    expect(config.module).toBe('products');
    expect(config.routeBase).toBe('/products');
  });

  it('should create form with correct controls', () => {
    expect(component.form.contains('name')).toBe(true);
    expect(component.form.contains('categoryId')).toBe(true);
    expect(component.form.contains('description')).toBe(true);
    expect(component.form.contains('active')).toBe(true);
    expect(component.form.contains('composite')).toBe(true);
    expect(component.form.contains('purchasePrice')).toBe(true);
    expect(component.form.contains('photo')).toBe(true);
    expect(component.form.contains('components')).toBe(true);
    expect(component.form.contains('productPrices')).toBe(true);
  });

  it('should have name as required with maxLength 150', () => {
    const nameControl = component.form.get('name');
    nameControl?.setValue('');
    expect(nameControl?.hasError('required')).toBe(true);
    nameControl?.setValue('a'.repeat(151));
    expect(nameControl?.hasError('maxlength')).toBe(true);
  });

  it('should have categoryId as required', () => {
    const catControl = component.form.get('categoryId');
    catControl?.setValue(null);
    expect(catControl?.hasError('required')).toBe(true);
  });

  it('should have purchasePrice with min 0', () => {
    const priceControl = component.form.get('purchasePrice');
    priceControl?.setValue(-1);
    expect(priceControl?.hasError('min')).toBe(true);
  });

  it('should set submitTooltip when form is invalid', () => {
    expect(component.submitTooltip()).toContain('Campos requeridos');
  });

  it('should clear submitTooltip when form is valid', () => {
    component.form.get('name')?.setValue('Valid Name');
    component.form.get('categoryId')?.setValue('cat-001');
    expect(component.submitTooltip()).toBe('');
  });

  it('should show warning and mark form as touched on submit with invalid form', () => {
    const addSpy = vi.spyOn(messageService, 'add');
    const markAllAsTouchedSpy = vi.spyOn(component.form, 'markAllAsTouched');
    component.onSubmit();
    expect(markAllAsTouchedSpy).toHaveBeenCalled();
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Por favor, complete todos los campos requeridos.',
      life: 5000,
    });
  });

  it('should call create on submit with valid form in create mode', () => {
    component.form.get('name')?.setValue('New Product');
    component.form.get('categoryId')?.setValue('cat-001');
    component.onSubmit();
    expect(mockService.create).toHaveBeenCalled();
  });

  it('should navigate to /products on create success', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.form.get('name')?.setValue('New Product');
    component.form.get('categoryId')?.setValue('cat-001');
    component.onSubmit();
    expect(navigateSpy).toHaveBeenCalledWith(['/products']);
  });

  it('should show success message on create success', () => {
    const addSpy = vi.spyOn(messageService, 'add');
    component.form.get('name')?.setValue('New Product');
    component.form.get('categoryId')?.setValue('cat-001');
    component.onSubmit();
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Producto creado exitosamente',
      life: 3000,
    });
  });

  it('should show error message on create failure', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed(
      null,
      of(mockProduct),
      throwError(() => new Error('Failed')),
    );
    createComponent();

    const addSpy = vi.spyOn(messageService, 'add');
    component.form.get('name')?.setValue('New Product');
    component.form.get('categoryId')?.setValue('cat-001');
    component.onSubmit();
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al crear el producto.',
      life: 5000,
    });
  });

  it('should add component to components array', () => {
    component.form.get('composite')?.setValue(true);
    const initialLength = component.componentsArray.length;
    component.addComponent();
    expect(component.componentsArray.length).toBe(initialLength + 1);
  });

  it('should remove component from components array', () => {
    component.form.get('composite')?.setValue(true);
    component.addComponent();
    const length = component.componentsArray.length;
    component.removeComponent(0);
    expect(component.componentsArray.length).toBe(length - 1);
  });

  it('should clear components array when composite is set to false', () => {
    component.form.get('composite')?.setValue(true);
    component.addComponent();
    expect(component.componentsArray.length).toBeGreaterThan(0);
    component.form.get('composite')?.setValue(false);
    expect(component.componentsArray.length).toBe(0);
  });

  it('should set isComposite signal when composite value changes', () => {
    expect(component.isComposite()).toBe(false);
    component.form.get('composite')?.setValue(true);
    expect(component.isComposite()).toBe(true);
  });

  it('should delete photo and show success message', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed('prod-001');
    createComponent();

    const addSpy = vi.spyOn(messageService, 'add');
    component.onDeletePhoto();
    expect(mockPhotoService.deletePhoto).toHaveBeenCalledWith('prod-001');
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Foto eliminada exitosamente',
      life: 3000,
    });
  });

  it('should not delete photo if no entity id', () => {
    component.onDeletePhoto();
    expect(mockPhotoService.deletePhoto).not.toHaveBeenCalled();
  });

  it('should return pending tab title from formData name', () => {
    const title = component['getPendingTabTitle']({
      name: 'My Product',
      categoryId: 'cat-001',
      description: '',
      active: true,
      composite: false,
      purchasePrice: null,
      photo: null,
      components: [],
      productPrices: [],
    });
    expect(title).toBe('My Product');
  });

  it('should return default pending tab title when name is empty', () => {
    const title = component['getPendingTabTitle']({
      name: '',
      categoryId: 'cat-001',
      description: '',
      active: true,
      composite: false,
      purchasePrice: null,
      photo: null,
      components: [],
      productPrices: [],
    });
    expect(title).toContain('Nuevo');
  });

  it('should restore form data from pending tab', () => {
    component.restoreFormData({
      name: 'Restored Product',
      categoryId: 'cat-002',
      description: 'Restored desc',
      active: false,
      composite: true,
      purchasePrice: 40,
      photo: null,
      components: [],
      productPrices: [],
    });
    expect(component.form.get('name')?.value).toBe('Restored Product');
    expect(component.form.get('categoryId')?.value).toBe('cat-002');
    expect(component.form.get('active')?.value).toBe(false);
    expect(component.isComposite()).toBe(true);
  });

  it('should load entity and populate form in edit mode', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed('prod-001');
    createComponent();

    expect(mockService.loadById).toHaveBeenCalledWith('prod-001');
    expect(component.form.get('name')?.value).toBe('Test Product');
    expect(component.form.get('categoryId')?.value).toBe('cat-001');
    expect(component.isComposite()).toBe(false);
  });

  it('should show error and navigate on load entity failure', async () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed(
      'prod-999',
      throwError(() => new Error('Not found')),
    );
    createComponent();

    await fixture.whenStable();

    const addSpy = vi.spyOn(messageService, 'add');
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.onLoadEntity('prod-999');

    expect(addSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al cargar el producto.',
      life: 5000,
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/products']);
  });

  it('should call update on submit with valid form in edit mode', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed('prod-001');
    createComponent();

    component.form.get('name')?.setValue('Updated Product');
    component.onSubmit();
    expect(mockService.update).toHaveBeenCalledWith('prod-001', expect.any(Object));
  });

  it('should show success message on update success', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed('prod-001');
    createComponent();

    const addSpy = vi.spyOn(messageService, 'add');
    component.form.get('name')?.setValue('Updated Product');
    component.onSubmit();
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Producto actualizado exitosamente',
      life: 3000,
    });
  });

  it('should show error message on update failure', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed(
      'prod-001',
      of(mockProduct),
      of(mockProduct),
      throwError(() => new Error('Failed')),
    );
    createComponent();

    const addSpy = vi.spyOn(messageService, 'add');
    component.form.get('name')?.setValue('Updated Product');
    component.onSubmit();
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al actualizar el producto.',
      life: 5000,
    });
  });

  it('should access pricesArray getter', () => {
    expect(component.pricesArray).toBeDefined();
  });

  it('should access asFormControl helper', () => {
    const control = component.asFormControl('name');
    expect(control).toBeDefined();
  });
});
