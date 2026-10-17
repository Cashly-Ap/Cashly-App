import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ReactiveFormsModule } from '@angular/forms';
import { PriceTypesFormPageComponent } from '@features/catalog/price-types/pages/price-types-form-page/price-types-form-page.component';
import { PriceTypeApplicationService } from '@features/catalog/price-types/services/application/price-type-application.service';
import { PriceTypeDetails } from '@features/catalog/price-types/models/interfaces/price-type-details.interface';
import { CatalogPdfApiService } from '@features/catalog/products/reporting/services/api/catalog-pdf-api.service';
import { StockPdfApiService } from '@features/inventory/warehouses/reporting/services/api/stock-pdf-api.service';
import { MovementsPdfApiService } from '@features/inventory/warehouses/reporting/services/api/movements-pdf-api.service';
import { OrderPdfApiService } from '@features/sales/orders/reporting/services/api/order-pdf-api.service';
import { InvoicePdfApiService } from '@features/finance/billing/invoices/reporting/services/api/invoice-pdf-api.service';
import { QuotePdfApiService } from '@features/sales/quotes/reporting/services/api/quote-pdf-api.service';

describe('PriceTypesFormPageComponent', () => {
  let component: PriceTypesFormPageComponent;
  let fixture: ComponentFixture<PriceTypesFormPageComponent>;
  let mockService: Partial<PriceTypeApplicationService>;
  let router: Router;
  let messageService: MessageService;

  const mockPriceType: PriceTypeDetails = {
    id: 'pt-001',
    name: 'Retail',
    active: true,
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
      loadAll: vi.fn().mockReturnValue(of([])),
      loadById: vi.fn().mockReturnValue(of(mockPriceType)),
      create: vi.fn().mockReturnValue(of(mockPriceType)),
      update: vi.fn().mockReturnValue(of(mockPriceType)),
      remove: vi.fn().mockReturnValue(of(undefined)),
      priceTypes: signal([]),
      selectedPriceType: signal(null),
      isLoading: signal(false),
      error: signal(null),
    };

    TestBed.configureTestingModule({
      imports: [PriceTypesFormPageComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => id }),
            snapshot: { paramMap: { get: () => id }, queryParamMap: { get: () => null } },
          },
        },
        { provide: PriceTypeApplicationService, useValue: mockService },
        MessageService,
        ...pdfMocks,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.compileComponents();
  }

  function createComponent() {
    fixture = TestBed.createComponent(PriceTypesFormPageComponent);
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

  it('should create a form with name and active fields', () => {
    expect(component.form).toBeDefined();
    expect(component.form.get('name')).toBeDefined();
    expect(component.form.get('active')).toBeDefined();
  });

  it('should have name field as required', () => {
    const nameControl = component.form.get('name');
    nameControl?.setValue('');
    expect(nameControl?.invalid).toBe(true);
  });

  it('should have name field valid when value provided', () => {
    const nameControl = component.form.get('name');
    nameControl?.setValue('Test Price Type');
    expect(nameControl?.valid).toBe(true);
  });

  it('should have active field default to true', () => {
    expect(component.form.get('active')?.value).toBe(true);
  });

  it('should return correct config', () => {
    const config = component.getConfig();
    expect(config.entityDisplayName).toBe('Tipo de Precio');
    expect(config.entityArticle).toBe('del');
    expect(config.module).toBe('price-types');
    expect(config.routeBase).toBe('/catalog/price-types');
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
    component.form.get('name')?.setValue('New Price Type');
    component.onSubmit();
    expect(mockService.create).toHaveBeenCalledWith({ name: 'New Price Type' });
  });

  it('should navigate to /price-types on create success', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.form.get('name')?.setValue('New Price Type');
    component.onSubmit();
    expect(navigateSpy).toHaveBeenCalledWith(['/catalog/price-types']);
  });

  it('should show success message on create success', () => {
    const addSpy = vi.spyOn(messageService, 'add');
    component.form.get('name')?.setValue('New Price Type');
    component.onSubmit();
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Tipo de precio creado exitosamente',
      life: 3000,
    });
  });

  it('should show error message on create failure', () => {
    mockService.create = vi.fn().mockReturnValue(throwError(() => new Error('Create failed')));
    const addSpy = vi.spyOn(messageService, 'add');
    component.form.get('name')?.setValue('New Price Type');
    component.onSubmit();
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al crear el tipo de precio.',
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
    configureTestBed('pt-001');
    createComponent();
    fixture.detectChanges();
    component.form.get('name')?.setValue('Updated Price Type');
    component.onSubmit();
    expect(mockService.update).toHaveBeenCalledWith('pt-001', {
      name: 'Updated Price Type',
      active: true,
    });
  });

  it('should show success message on update success', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed('pt-001');
    createComponent();
    fixture.detectChanges();
    const addSpy = vi.spyOn(messageService, 'add');
    component.form.get('name')?.setValue('Updated Price Type');
    component.onSubmit();
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Tipo de precio actualizado exitosamente',
      life: 3000,
    });
  });

  it('should show error message on update failure', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed('pt-001');
    mockService.update = vi.fn().mockReturnValue(throwError(() => new Error('Update failed')));
    createComponent();
    fixture.detectChanges();
    const addSpy = vi.spyOn(messageService, 'add');
    component.form.get('name')?.setValue('Updated Price Type');
    component.onSubmit();
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al actualizar el tipo de precio.',
      life: 5000,
    });
  });

  it('should load entity and patch form in edit mode', () => {
    component.onLoadEntity('pt-001');
    expect(mockService.loadById).toHaveBeenCalledWith('pt-001');
  });

  it('should patch form values on load entity success', () => {
    component.onLoadEntity('pt-001');
    expect(component.form.get('name')?.value).toBe('Retail');
    expect(component.form.get('active')?.value).toBe(true);
  });

  it('should show error and navigate on load entity failure', () => {
    mockService.loadById = vi.fn().mockReturnValue(throwError(() => new Error('Not found')));
    const addSpy = vi.spyOn(messageService, 'add');
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onLoadEntity('pt-999');
    expect(addSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al cargar el tipo de precio.',
      life: 5000,
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/catalog/price-types']);
  });

  it('should restore form data from pending tab', () => {
    component.restoreFormData({ name: 'Pending Name', active: false });
    expect(component.form.get('name')?.value).toBe('Pending Name');
    expect(component.form.get('active')?.value).toBe(false);
  });

  it('should return pending tab title with form data name', () => {
    const title = component['getPendingTabTitle']({ name: 'Draft Price Type', active: true });
    expect(title).toBe('Draft Price Type');
  });

  it('should return default pending tab title when name is empty', () => {
    const title = component['getPendingTabTitle']({ name: '', active: true });
    expect(title).toContain('Tipo de Precio');
  });
});
