import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActivatedRoute, Router } from '@angular/router';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { WarehousesDetailsPageComponent } from './warehouses-details-page.component';
import { WarehouseApplicationService } from '@features/warehouses/services/application';
import { WarehouseDetails, WarehouseMovementItem } from '@features/warehouses/models/interfaces';
import { CatalogPdfApiService } from '@features/reports/inventory/services/api/catalog-pdf-api.service';
import { StockPdfApiService } from '@features/reports/inventory/services/api/stock-pdf-api.service';
import { MovementsPdfApiService } from '@features/reports/inventory/services/api/movements-pdf-api.service';
import { OrderPdfApiService } from '@features/reports/orders/services/api/order-pdf-api.service';
import { InvoicePdfApiService } from '@features/reports/invoices/services/api/invoice-pdf-api.service';
import { QuotePdfApiService } from '@features/reports/quotes/services/api/quote-pdf-api.service';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

describe('WarehousesDetailsPageComponent', () => {
  let component: WarehousesDetailsPageComponent;
  let fixture: ComponentFixture<WarehousesDetailsPageComponent>;
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
    stock: [
      { productId: 'p1', productName: 'Motor 10HP', unit: '', quantity: 50 },
      { productId: 'p2', productName: 'Motor 5HP', unit: '', quantity: 30 },
    ],
    recentMovements: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-15T10:30:00Z',
  };

  const mockMovements: PagedResponse<WarehouseMovementItem> = {
    content: [
      {
        id: 'm1',
        warehouseId: 'wh-001',
        productId: 'p1',
        productCode: 'MOT-10',
        productName: 'Motor 10HP',
        movementType: 'ENTRY',
        quantity: 10,
        previousStock: 40,
        newStock: 50,
        createdAt: '2025-01-15T10:30:00Z',
      },
    ],
    totalElements: 1,
    totalPages: 1,
    size: 15,
    number: 0,
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
    id: string | null = 'wh-001',
    loadByIdValue: any = of(mockWarehouse),
    getMovementsValue: any = of(mockMovements),
    getStockValue: any = of(mockWarehouse.stock),
  ) {
    mockService = {
      loadById: vi.fn().mockReturnValue(loadByIdValue),
      getStock: vi.fn().mockReturnValue(getStockValue),
      getMovements: vi.fn().mockReturnValue(getMovementsValue),
      loadSimpleWarehouses: vi.fn().mockReturnValue(of([])),
      warehouses: signal([]),
      simpleWarehouses: signal([]),
      currentWarehouse: signal(null),
      loading: signal(false),
      error: signal(null),
      totalElements: signal(0),
    };

    TestBed.configureTestingModule({
      imports: [WarehousesDetailsPageComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => id } } } },
        { provide: WarehouseApplicationService, useValue: mockService },
        MessageService,
        ...pdfMocks,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.compileComponents();
  }

  function createComponent() {
    fixture = TestBed.createComponent(WarehousesDetailsPageComponent);
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

  it('should have null warehouse initially', () => {
    expect(component.warehouse()).toBeNull();
  });

  it('should not be loading initially', () => {
    expect(component.loading()).toBe(false);
  });

  it('should load warehouse on init', () => {
    fixture.detectChanges();
    expect(mockService.loadById).toHaveBeenCalledWith('wh-001');
  });

  it('should set warehouse on load success', () => {
    fixture.detectChanges();
    expect(component.warehouse()?.id).toBe('wh-001');
    expect(component.warehouse()?.name).toBe('Almacén Central');
  });

  it('should merge stock into warehouse on load success', () => {
    fixture.detectChanges();
    expect(component.warehouse()?.stock).toHaveLength(2);
  });

  it('should set loading to false after load', () => {
    fixture.detectChanges();
    expect(component.loading()).toBe(false);
  });

  it('should show error message and navigate on load failure', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed(
      'wh-999',
      throwError(() => new Error('Not found')),
    );
    createComponent();

    const addSpy = vi.spyOn(messageService, 'add');
    const navigateSpy = vi.spyOn(router, 'navigate');

    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al cargar el almacén.',
      life: 5000,
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/warehouses']);
  });

  it('should navigate to /warehouses/{id}/edit on onEdit', () => {
    component.warehouse.set(mockWarehouse);
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onEdit();
    expect(navigateSpy).toHaveBeenCalledWith(['/warehouses', 'wh-001', 'edit']);
  });

  it('should not navigate on onEdit if warehouse is null', () => {
    component.warehouse.set(null);
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onEdit();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should navigate to /warehouses on onBack', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onBack();
    expect(navigateSpy).toHaveBeenCalledWith(['/warehouses']);
  });

  it('should not load warehouse if id is null', () => {
    (TestBed as TestBedStatic).resetTestingModule();
    configureTestBed(null);
    createComponent();
    fixture.detectChanges();

    expect(mockService.loadById).not.toHaveBeenCalled();
  });

  describe('stock filtering and pagination', () => {
    beforeEach(() => {
      component.warehouse.set(mockWarehouse);
    });

    it('should return all stock when search is empty', () => {
      component.stockSearch.set('');
      expect(component.filteredStock()).toHaveLength(2);
    });

    it('should filter stock by product name', () => {
      component.stockSearch.set('Motor 10');
      expect(component.filteredStock()).toHaveLength(1);
      expect(component.filteredStock()[0].productName).toBe('Motor 10HP');
    });

    it('should reset page when search changes', () => {
      component.stockPage.set(2);
      component.onStockSearchChange();
      expect(component.stockPage()).toBe(0);
    });

    it('should paginate stock correctly', () => {
      component.stockPage.set(0);
      expect(component.pagedStock().length).toBeLessThanOrEqual(10);
    });
  });

  describe('movements', () => {
    beforeEach(() => {
      component.warehouse.set(mockWarehouse);
    });

    it('should toggle movements visibility', () => {
      expect(component.showMovements()).toBe(false);
      component.onToggleMovements();
      expect(component.showMovements()).toBe(true);
    });

    it('should load movements when toggling on for first time', () => {
      component.onToggleMovements();
      expect(mockService.getMovements).toHaveBeenCalledWith('wh-001', { page: 0, size: 15 });
    });

    it('should not reload movements when toggling off and on again', () => {
      component.onToggleMovements();
      (mockService.getMovements as ReturnType<typeof vi.fn>).mockClear();
      component.onToggleMovements();
      component.onToggleMovements();
      expect(mockService.getMovements).not.toHaveBeenCalled();
    });

    it('should load movements with type filter', () => {
      component.onToggleMovements();
      component.movementTypeFilter.set('ENTRY');
      component.onMovementTypeChange();
      expect(mockService.getMovements).toHaveBeenCalledWith('wh-001', { page: 0, size: 15 });
    });

    it('should update movements list on load success', () => {
      component.onToggleMovements();
      expect(component.movementsList()).toHaveLength(1);
      expect(component.movementsLoading()).toBe(false);
    });

    it('should show error message on movements load failure', () => {
      (TestBed as TestBedStatic).resetTestingModule();
      configureTestBed(
        'wh-001',
        of(mockWarehouse),
        throwError(() => new Error('Fail')),
      );
      createComponent();
      component.warehouse.set(mockWarehouse);

      const addSpy = vi.spyOn(messageService, 'add');
      component.onToggleMovements();

      expect(addSpy).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar los movimientos.',
        life: 5000,
      });
    });

    it('should reset page on movement type change', () => {
      component.movementsPage.set(2);
      component.onMovementTypeChange();
      expect(component.movementsPage()).toBe(0);
    });

    it('should load movements on page change', () => {
      component.onToggleMovements();
      (mockService.getMovements as ReturnType<typeof vi.fn>).mockClear();
      component.onMovementsPageChange(1);
      expect(mockService.getMovements).toHaveBeenCalledWith('wh-001', { page: 1, size: 15 });
    });
  });

  describe('getMovementTypeLabel', () => {
    it('should return label for ENTRY', () => {
      expect(component.getMovementTypeLabel('ENTRY')).toBe('Entrada');
    });

    it('should return label for EXIT', () => {
      expect(component.getMovementTypeLabel('EXIT')).toBe('Salida');
    });

    it('should return label for ADJUSTMENT', () => {
      expect(component.getMovementTypeLabel('ADJUSTMENT')).toBe('Ajuste');
    });

    it('should return label for COMPONENT_EXIT', () => {
      expect(component.getMovementTypeLabel('COMPONENT_EXIT')).toBe('Salida por componente');
    });

    it('should return label for TRANSFER_IN', () => {
      expect(component.getMovementTypeLabel('TRANSFER_IN')).toBe('Transferencia entrada');
    });

    it('should return label for TRANSFER_OUT', () => {
      expect(component.getMovementTypeLabel('TRANSFER_OUT')).toBe('Transferencia salida');
    });

    it('should return raw type for unknown types', () => {
      expect(component.getMovementTypeLabel('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('getMovementTypeBadgeClass', () => {
    it('should return green class for ENTRY', () => {
      const cls = component.getMovementTypeBadgeClass('ENTRY');
      expect(cls).toContain('bg-green-100');
    });

    it('should return red class for EXIT', () => {
      const cls = component.getMovementTypeBadgeClass('EXIT');
      expect(cls).toContain('bg-red-100');
    });

    it('should return yellow class for ADJUSTMENT', () => {
      const cls = component.getMovementTypeBadgeClass('ADJUSTMENT');
      expect(cls).toContain('bg-yellow-100');
    });

    it('should return orange class for COMPONENT_EXIT', () => {
      const cls = component.getMovementTypeBadgeClass('COMPONENT_EXIT');
      expect(cls).toContain('bg-orange-100');
    });

    it('should return blue class for TRANSFER_IN', () => {
      const cls = component.getMovementTypeBadgeClass('TRANSFER_IN');
      expect(cls).toContain('bg-blue-100');
    });

    it('should return purple class for TRANSFER_OUT', () => {
      const cls = component.getMovementTypeBadgeClass('TRANSFER_OUT');
      expect(cls).toContain('bg-purple-100');
    });

    it('should return default class for unknown types', () => {
      const cls = component.getMovementTypeBadgeClass('UNKNOWN');
      expect(cls).toContain('bg-surface-100');
    });
  });
});
