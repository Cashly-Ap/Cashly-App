import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRoute, Router } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { WarehousesFormPageComponent } from '@features/inventory/warehouses/pages/warehouses-form-page/warehouses-form-page.component';
import { WarehouseApplicationService } from '@features/inventory/warehouses/services/application/warehouse-application.service';
import { WarehouseDetails } from '@features/inventory/warehouses/models/interfaces/warehouse.interfaces';
import { CatalogPdfApiService } from '@features/catalog/products/reporting/services/api/catalog-pdf-api.service';
import { StockPdfApiService } from '@features/inventory/warehouses/reporting/services/api/stock-pdf-api.service';
import { MovementsPdfApiService } from '@features/inventory/warehouses/reporting/services/api/movements-pdf-api.service';
import { OrderPdfApiService } from '@features/sales/orders/reporting/services/api/order-pdf-api.service';
import { InvoicePdfApiService } from '@features/finance/billing/invoices/reporting/services/api/invoice-pdf-api.service';
import { QuotePdfApiService } from '@features/sales/quotes/reporting/services/api/quote-pdf-api.service';
import { FormMode } from '@core/forms/enums/form-mode.enum';
import { PendingTabsService } from '@core/pending-tabs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

describe('WarehousesFormPageComponent', () => {
  let component: WarehousesFormPageComponent;
  let fixture: ComponentFixture<WarehousesFormPageComponent>;
  let mockService: Partial<WarehouseApplicationService>;
  let router: Router;
  let messageService: MessageService;

  const mockWarehouse: WarehouseDetails = {
    id: 'wh-001',
    name: 'Almacén Central',
    state: 'Distrito Capital',
    municipality: 'Libertador',
    address: 'Av. Principal #123',
    description: 'Almacén principal',
    active: true,
    stock: [],
    recentMovements: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T10:30:00Z',
  };

  const pdfMocks = [
    { provide: CatalogPdfApiService, useValue: { downloadPdf: vi.fn() } },
    { provide: StockPdfApiService, useValue: { getPdf: vi.fn() } },
    { provide: MovementsPdfApiService, useValue: { getPdf: vi.fn() } },
    { provide: OrderPdfApiService, useValue: { downloadOrdersReportPdf: vi.fn() } },
    { provide: InvoicePdfApiService, useValue: { downloadInvoicesReportPdf: vi.fn() } },
    { provide: QuotePdfApiService, useValue: { downloadQuotesReportPdf: vi.fn() } },
  ];

  const mockPendingTabsService = {
    get: vi.fn().mockReturnValue(null),
    save: vi.fn(),
    remove: vi.fn(),
    tabCount: signal(0),
    allTabs: signal([]),
  };

  function configureTestBed(
    id: string | null = null,
    loadByIdValue: any = of(mockWarehouse),
    createValue: any = of(mockWarehouse),
    updateValue: any = of(mockWarehouse),
  ) {
    mockService = {
      loadById: vi.fn().mockReturnValue(loadByIdValue),
      create: vi.fn().mockReturnValue(createValue),
      update: vi.fn().mockReturnValue(updateValue),
      loadSimpleWarehouses: vi.fn().mockReturnValue(of([])),
      warehouses: signal([]),
      simpleWarehouses: signal([]),
      currentWarehouse: signal(null),
      loading: signal(false),
      error: signal(null),
      totalElements: signal(0),
    };

    const paramMap = { get: (key: string) => (key === 'id' ? id : null) };

    TestBed.configureTestingModule({
      imports: [WarehousesFormPageComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap, queryParamMap: { get: () => null } },
            paramMap: of({ get: () => id }),
          },
        },
        { provide: WarehouseApplicationService, useValue: mockService },
        { provide: PendingTabsService, useValue: mockPendingTabsService },
        MessageService,
        ...pdfMocks,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.compileComponents();
  }

  function createComponent() {
    fixture = TestBed.createComponent(WarehousesFormPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    messageService = TestBed.inject(MessageService);
  }

  beforeEach(() => {
    mockPendingTabsService.get.mockReturnValue(null);
    mockPendingTabsService.save.mockClear();
    mockPendingTabsService.remove.mockClear();
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed();
    createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be in CREATE mode when no id', () => {
    fixture.detectChanges();
    expect(component.mode()).toBe(FormMode.CREATE);
  });

  it('should be in EDIT mode when id is provided', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed('wh-001');
    createComponent();
    fixture.detectChanges();
    expect(component.mode()).toBe(FormMode.EDIT);
  });

  it('should have correct form structure', () => {
    fixture.detectChanges();
    expect(component.form.get('name')).toBeTruthy();
    expect(component.form.get('state')).toBeTruthy();
    expect(component.form.get('municipality')).toBeTruthy();
    expect(component.form.get('address')).toBeTruthy();
    expect(component.form.get('description')).toBeTruthy();
    expect(component.form.get('active')).toBeTruthy();
  });

  it('should mark name as required', () => {
    fixture.detectChanges();
    const nameControl = component.form.get('name');
    nameControl?.setValue('');
    expect(nameControl?.hasError('required')).toBe(true);
  });

  it('should mark state as required', () => {
    fixture.detectChanges();
    const stateControl = component.form.get('state');
    stateControl?.setValue('');
    expect(stateControl?.hasError('required')).toBe(true);
  });

  it('should mark municipality as required', () => {
    fixture.detectChanges();
    const municipalityControl = component.form.get('municipality');
    municipalityControl?.setValue('');
    expect(municipalityControl?.hasError('required')).toBe(true);
  });

  it('should have correct config', () => {
    fixture.detectChanges();
    const config = component.getConfig();
    expect(config.entityDisplayName).toBe('Almacén');
    expect(config.entityArticle).toBe('del');
    expect(config.module).toBe('warehouses');
    expect(config.routeBase).toBe('/inventory/warehouses');
  });

  it('should have state options', () => {
    fixture.detectChanges();
    expect(component.stateOptions.length).toBeGreaterThan(0);
  });

  it('should compute municipality options based on selected state', () => {
    fixture.detectChanges();
    component.selectedStateName.set('Distrito Capital');
    const options = component.municipalityOptions();
    expect(options.length).toBeGreaterThan(0);
  });

  it('should return empty municipality options when no state selected', () => {
    fixture.detectChanges();
    component.selectedStateName.set(null);
    expect(component.municipalityOptions()).toEqual([]);
  });

  it('should clear municipality when state changes', () => {
    fixture.detectChanges();
    component.form.get('state')?.setValue('Zulia');
    fixture.detectChanges();
    expect(component.form.get('municipality')?.value).toBe('');
  });

  it('should update submit tooltip when form is invalid', () => {
    fixture.detectChanges();
    expect(component.submitTooltip()).toContain('Campos requeridos');
  });

  it('should clear submit tooltip when form is valid', () => {
    fixture.detectChanges();
    component.form.patchValue({
      name: 'Test Warehouse',
      state: 'Distrito Capital',
      municipality: 'Libertador',
    });
    fixture.detectChanges();
    expect(component.submitTooltip()).toBe('');
  });

  describe('onSubmit - CREATE mode', () => {
    it('should call service.create with payload when form is valid', () => {
      fixture.detectChanges();
      component.form.patchValue({
        name: 'Nuevo Almacén',
        state: 'Distrito Capital',
        municipality: 'Libertador',
        address: 'Av. Principal',
        description: 'Test',
        active: true,
      });

      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onSubmit();

      expect(mockService.create).toHaveBeenCalledWith({
        name: 'Nuevo Almacén',
        state: 'Distrito Capital',
        municipality: 'Libertador',
        address: 'Av. Principal',
        description: 'Test',
        active: true,
      });
    });

    it('should navigate to /warehouses on create success', () => {
      fixture.detectChanges();
      component.form.patchValue({
        name: 'Nuevo Almacén',
        state: 'Distrito Capital',
        municipality: 'Libertador',
      });

      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onSubmit();

      expect(navigateSpy).toHaveBeenCalledWith(['/inventory/warehouses']);
    });

    it('should show error message on create failure', () => {
      (TestBed as TestBedStatic).resetTestingModule();
      configureTestBed(
        null,
        of(mockWarehouse),
        throwError(() => new Error('Fail')),
      );
      createComponent();
      fixture.detectChanges();
      component.form.patchValue({
        name: 'Nuevo Almacén',
        state: 'Distrito Capital',
        municipality: 'Libertador',
      });

      const addSpy = vi.spyOn(messageService, 'add');
      component.onSubmit();

      expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });

    it('should mark all fields as touched when form is invalid', () => {
      fixture.detectChanges();
      component.onSubmit();
      expect(component.form.get('name')?.touched).toBe(true);
      expect(component.form.get('state')?.touched).toBe(true);
    });

    it('should show warning message when form is invalid', () => {
      fixture.detectChanges();
      const addSpy = vi.spyOn(messageService, 'add');
      component.onSubmit();
      expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'warn' }));
    });

    it('should convert empty address to undefined', () => {
      fixture.detectChanges();
      component.form.patchValue({
        name: 'Nuevo Almacén',
        state: 'Distrito Capital',
        municipality: 'Libertador',
        address: '',
        description: '',
        active: true,
      });

      component.onSubmit();

      expect(mockService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          address: undefined,
          description: undefined,
        }),
      );
    });
  });

  describe('onSubmit - EDIT mode', () => {
    beforeEach(() => {
      (TestBed as TestBedStatic).resetTestingModule();
      configureTestBed('wh-001');
      createComponent();
      fixture.detectChanges();
    });

    it('should call service.update with payload when form is valid', () => {
      component.form.patchValue({
        name: 'Almacén Actualizado',
        state: 'Carabobo',
        municipality: 'Valencia',
      });

      component.onSubmit();

      expect(mockService.update).toHaveBeenCalledWith(
        'wh-001',
        expect.objectContaining({
          name: 'Almacén Actualizado',
          state: 'Carabobo',
          municipality: 'Valencia',
        }),
      );
    });

    it('should navigate to /warehouses on update success', () => {
      component.form.patchValue({
        name: 'Almacén Actualizado',
        state: 'Carabobo',
        municipality: 'Valencia',
      });

      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onSubmit();

      expect(navigateSpy).toHaveBeenCalledWith(['/inventory/warehouses']);
    });

    it('should show error message on update failure', () => {
      (TestBed as TestBedStatic).resetTestingModule();
      configureTestBed(
        'wh-001',
        of(mockWarehouse),
        of(mockWarehouse),
        throwError(() => new Error('Fail')),
      );
      createComponent();
      fixture.detectChanges();

      component.form.patchValue({
        name: 'Almacén Actualizado',
        state: 'Carabobo',
        municipality: 'Valencia',
      });

      const addSpy = vi.spyOn(messageService, 'add');
      component.onSubmit();

      expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });
  });

  describe('onLoadEntity', () => {
    it('should load warehouse and patch form values', () => {
      (TestBed as TestBedStatic).resetTestingModule();
      configureTestBed('wh-001');
      createComponent();
      fixture.detectChanges();

      expect(component.form.get('name')?.value).toBe('Almacén Central');
      expect(component.form.get('state')?.value).toBe('Distrito Capital');
      expect(component.form.get('municipality')?.value).toBe('Libertador');
      expect(component.selectedStateName()).toBe('Distrito Capital');
    });

    it('should navigate to /warehouses on load failure', () => {
      (TestBed as TestBedStatic).resetTestingModule();
      configureTestBed(
        'wh-999',
        throwError(() => new Error('Not found')),
      );
      createComponent();

      const navigateSpy = vi.spyOn(router, 'navigate');
      fixture.detectChanges();

      expect(navigateSpy).toHaveBeenCalledWith(['/inventory/warehouses']);
    });

    it('should show error message on load failure', () => {
      (TestBed as TestBedStatic).resetTestingModule();
      configureTestBed(
        'wh-999',
        throwError(() => new Error('Not found')),
      );
      createComponent();

      const addSpy = vi.spyOn(messageService, 'add');
      fixture.detectChanges();

      expect(addSpy).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar el almacén.',
        life: 5000,
      });
    });
  });

  describe('restoreFormData', () => {
    it('should restore form data and selected state', () => {
      fixture.detectChanges();
      const formData = {
        name: 'Restored',
        state: 'Zulia',
        municipality: 'Maracaibo',
        address: 'Calle 5',
        description: 'Test',
        active: false,
      };

      component.restoreFormData(formData);

      expect(component.form.get('name')?.value).toBe('Restored');
      expect(component.form.get('state')?.value).toBe('Zulia');
      expect(component.form.get('municipality')?.value).toBe('Maracaibo');
      expect(component.selectedStateName()).toBe('Zulia');
      expect(component.form.get('active')?.value).toBe(false);
    });
  });

  describe('asFormControl', () => {
    it('should return form control by name', () => {
      fixture.detectChanges();
      const control = component.asFormControl('name');
      expect(control).toBeTruthy();
    });
  });

  describe('getPendingTabTitle', () => {
    it('should return name when provided', () => {
      fixture.detectChanges();
      const title = component.getPendingTabTitle({
        name: 'My Warehouse',
        state: 'X',
        municipality: 'Y',
        address: '',
        description: '',
        active: true,
      });
      expect(title).toBe('My Warehouse');
    });

    it('should return fallback when name is empty', () => {
      fixture.detectChanges();
      const title = component.getPendingTabTitle({
        name: '',
        state: 'X',
        municipality: 'Y',
        address: '',
        description: '',
        active: true,
      });
      expect(title).toContain('Almacén');
    });
  });
});
