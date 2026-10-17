import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ReactiveFormsModule } from '@angular/forms';
import { CategoriesFormPageComponent } from '@features/categories/pages/categories-form-page/categories-form-page.component';
import { CategoryApplicationService } from '@features/categories/services/application/category-application.service';
import { CategoryDetails } from '@features/categories/models/interfaces/category-details.interface';
import { CatalogPdfApiService } from '@features/reports/inventory/services/api/catalog-pdf-api.service';
import { StockPdfApiService } from '@features/reports/inventory/services/api/stock-pdf-api.service';
import { MovementsPdfApiService } from '@features/reports/inventory/services/api/movements-pdf-api.service';
import { OrderPdfApiService } from '@features/reports/orders/services/api/order-pdf-api.service';
import { InvoicePdfApiService } from '@features/finance/billing/invoices/reporting/services/api/invoice-pdf-api.service';
import { QuotePdfApiService } from '@features/reports/quotes/services/api/quote-pdf-api.service';

describe('CategoriesFormPageComponent', () => {
  let component: CategoriesFormPageComponent;
  let fixture: ComponentFixture<CategoriesFormPageComponent>;
  let mockService: Partial<CategoryApplicationService>;
  let router: Router;
  let messageService: MessageService;

  const mockCategory: CategoryDetails = {
    id: 'cat-001',
    name: 'Electronics',
    description: 'Electronic products',
    active: true,
    productCount: 10,
    createdAt: '2025-01-01T00:00:00Z',
  };

  const pdfMocks = [
    { provide: CatalogPdfApiService, useValue: { downloadPdf: vi.fn() } },
    { provide: StockPdfApiService, useValue: { getPdf: vi.fn() } },
    { provide: MovementsPdfApiService, useValue: { getPdf: vi.fn() } },
    { provide: OrderPdfApiService, useValue: { downloadOrdersReportPdf: vi.fn() } },
    { provide: InvoicePdfApiService, useValue: { downloadInvoicesReportPdf: vi.fn() } },
    { provide: QuotePdfApiService, useValue: { downloadQuotesReportPdf: vi.fn() } },
  ];

  function configureTestBed(id: string | null = null) {
    mockService = {
      loadAll: vi
        .fn()
        .mockReturnValue(of({ content: [], totalElements: 0, totalPages: 0, size: 10, number: 0 })),
      loadById: vi.fn().mockReturnValue(of(mockCategory)),
      create: vi.fn().mockReturnValue(of(mockCategory)),
      update: vi.fn().mockReturnValue(of(mockCategory)),
      toggleActive: vi.fn().mockReturnValue(of(mockCategory)),
      delete: vi.fn().mockReturnValue(of(undefined)),
      categories: signal([]),
      currentCategory: signal(null),
      loading: signal(false),
      error: signal(null),
      totalElements: signal(0),
    };

    TestBed.configureTestingModule({
      imports: [CategoriesFormPageComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => id }),
            snapshot: { paramMap: { get: () => id }, queryParamMap: { get: () => null } },
          },
        },
        { provide: CategoryApplicationService, useValue: mockService },
        MessageService,
        ...pdfMocks,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.compileComponents();
  }

  function createComponent() {
    fixture = TestBed.createComponent(CategoriesFormPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    messageService = TestBed.inject(MessageService);
  }

  beforeEach(() => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed();
    createComponent();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a form with name, description, and active fields', () => {
    expect(component.form).toBeDefined();
    expect(component.form.get('name')).toBeDefined();
    expect(component.form.get('description')).toBeDefined();
    expect(component.form.get('active')).toBeDefined();
  });

  it('should have name field as required', () => {
    const nameControl = component.form.get('name');
    nameControl?.setValue('');
    expect(nameControl?.invalid).toBe(true);
  });

  it('should have name field valid when value provided', () => {
    const nameControl = component.form.get('name');
    nameControl?.setValue('Test Category');
    expect(nameControl?.valid).toBe(true);
  });

  it('should have active field default to true', () => {
    expect(component.form.get('active')?.value).toBe(true);
  });

  it('should return correct config', () => {
    const config = component.getConfig();
    expect(config.entityDisplayName).toBe('Categoría');
    expect(config.entityArticle).toBe('de la');
    expect(config.module).toBe('categories');
    expect(config.routeBase).toBe('/categories');
  });

  it('should be in create mode by default', () => {
    expect(component.isCreateMode()).toBe(true);
    expect(component.isEditMode()).toBe(false);
  });

  it('should update submit tooltip when form is invalid', () => {
    component.form.get('name')?.setValue('');
    component.form.get('name')?.markAsTouched();
    fixture.detectChanges();
    expect(component.submitTooltip()).toContain('Nombre');
  });

  it('should have empty submit tooltip when form is valid', () => {
    component.form.get('name')?.setValue('Valid Name');
    fixture.detectChanges();
    expect(component.submitTooltip()).toBe('');
  });

  it('should call create on submit in create mode', () => {
    component.form.get('name')?.setValue('New Category');
    component.onSubmit();
    expect(mockService.create).toHaveBeenCalledWith({
      name: 'New Category',
      description: undefined,
      active: true,
    });
  });

  it('should navigate to /categories on create success', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.form.get('name')?.setValue('New Category');
    component.onSubmit();
    expect(navigateSpy).toHaveBeenCalledWith(['/categories']);
  });

  it('should show success message on create success', () => {
    const addSpy = vi.spyOn(messageService, 'add');
    component.form.get('name')?.setValue('New Category');
    component.onSubmit();
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Categoría creada exitosamente',
      life: 3000,
    });
  });

  it('should show error message on create failure', () => {
    mockService.create = vi.fn().mockReturnValue(throwError(() => new Error('Create failed')));
    const addSpy = vi.spyOn(messageService, 'add');
    component.form.get('name')?.setValue('New Category');
    component.onSubmit();
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al crear la categoría.',
      life: 5000,
    });
  });

  it('should mark form as touched and show warning on invalid submit', () => {
    const addSpy = vi.spyOn(messageService, 'add');
    component.form.get('name')?.setValue('');
    component.onSubmit();
    expect(component.form.get('name')?.touched).toBe(true);
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Por favor, complete todos los campos requeridos.',
      life: 5000,
    });
  });

  it('should call update on submit in edit mode', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed('cat-001');
    createComponent();
    fixture.detectChanges();
    component.form.get('name')?.setValue('Updated Category');
    component.onSubmit();
    expect(mockService.update).toHaveBeenCalledWith('cat-001', {
      name: 'Updated Category',
      description: 'Electronic products',
      active: true,
    });
  });

  it('should show success message on update success', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed('cat-001');
    createComponent();
    fixture.detectChanges();
    const addSpy = vi.spyOn(messageService, 'add');
    component.form.get('name')?.setValue('Updated Category');
    component.onSubmit();
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Categoría actualizada exitosamente',
      life: 3000,
    });
  });

  it('should show error message on update failure', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed('cat-001');
    mockService.update = vi.fn().mockReturnValue(throwError(() => new Error('Update failed')));
    createComponent();
    fixture.detectChanges();
    const addSpy = vi.spyOn(messageService, 'add');
    component.form.get('name')?.setValue('Updated Category');
    component.onSubmit();
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al actualizar la categoría.',
      life: 5000,
    });
  });

  it('should load entity and patch form in edit mode', () => {
    component.onLoadEntity('cat-001');
    expect(mockService.loadById).toHaveBeenCalledWith('cat-001');
  });

  it('should patch form values on load entity success', () => {
    component.onLoadEntity('cat-001');
    expect(component.form.get('name')?.value).toBe('Electronics');
    expect(component.form.get('description')?.value).toBe('Electronic products');
    expect(component.form.get('active')?.value).toBe(true);
  });

  it('should show error and navigate on load entity failure', () => {
    mockService.loadById = vi.fn().mockReturnValue(throwError(() => new Error('Not found')));
    const addSpy = vi.spyOn(messageService, 'add');
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onLoadEntity('cat-999');
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al cargar la categoría.',
      life: 5000,
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/categories']);
  });

  it('should restore form data from pending tab', () => {
    component.restoreFormData({ name: 'Pending Name', description: 'Pending Desc', active: false });
    expect(component.form.get('name')?.value).toBe('Pending Name');
    expect(component.form.get('description')?.value).toBe('Pending Desc');
    expect(component.form.get('active')?.value).toBe(false);
  });

  it('should return pending tab title with form data name', () => {
    const title = component['getPendingTabTitle']({
      name: 'Draft Category',
      description: '',
      active: true,
    });
    expect(title).toBe('Draft Category');
  });

  it('should return default pending tab title when name is empty', () => {
    const title = component['getPendingTabTitle']({ name: '', description: '', active: true });
    expect(title).toContain('Categoría');
  });
});
