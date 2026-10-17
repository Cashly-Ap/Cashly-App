import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { CatalogPdfModalComponent } from '@features/catalog/products/reporting/components/catalog-pdf-modal/catalog-pdf-modal.component';
import { CategoryApplicationService } from '@features/catalog/categories/services/application/category-application.service';
import { WarehouseApplicationService } from '@features/warehouses/services/application/warehouse-application.service';

@Component({
  template: `<app-catalog-pdf-modal
    [visible]="visible"
    (visibleChange)="onVisibleChange($event)"
    (onGeneratePdf)="onGeneratePdf($event)"
  ></app-catalog-pdf-modal>`,
  imports: [CatalogPdfModalComponent],
})
class HostComponent {
  visible = false;
  onVisibleChange = vi.fn();
  onGeneratePdf = vi.fn();
}

function createMockCategoryService() {
  return {
    categories: vi.fn(() => []),
    loadAll: vi.fn(() => ({ subscribe: vi.fn() })),
  };
}

function createMockWarehouseService() {
  return {
    simpleWarehouses: vi.fn(() => []),
    loadSimpleWarehouses: vi.fn(() => ({ subscribe: vi.fn() })),
  };
}

describe('CatalogPdfModalComponent', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let component: CatalogPdfModalComponent;
  let mockCategoryService: ReturnType<typeof createMockCategoryService>;
  let mockWarehouseService: ReturnType<typeof createMockWarehouseService>;

  beforeEach(() => {
    mockCategoryService = createMockCategoryService();
    mockWarehouseService = createMockWarehouseService();

    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: CategoryApplicationService, useValue: mockCategoryService },
        { provide: WarehouseApplicationService, useValue: mockWarehouseService },
      ],
    });

    TestBed.compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default visible input as false', () => {
    expect(component.visible()).toBe(false);
  });

  it('should have default search signal as empty string', () => {
    expect(component.search()).toBe('');
  });

  it('should have default categoryId signal as null', () => {
    expect(component.categoryId()).toBeNull();
  });

  it('should have default warehouseId signal as null', () => {
    expect(component.warehouseId()).toBeNull();
  });

  it('should have default withStock signal as null', () => {
    expect(component.withStock()).toBeNull();
  });

  it('should have stockOptions with 3 options', () => {
    expect(component.stockOptions).toHaveLength(3);
    expect(component.stockOptions[0].label).toBe('Todos');
    expect(component.stockOptions[1].label).toBe('Con Stock');
    expect(component.stockOptions[2].label).toBe('Sin Stock');
  });

  it('should call loadAll when categories are empty on init', () => {
    component.loadFilters();
    expect(mockCategoryService.loadAll).toHaveBeenCalledWith({ size: 1000 });
  });

  it('should call loadSimpleWarehouses when warehouses are empty on init', () => {
    component.loadFilters();
    expect(mockWarehouseService.loadSimpleWarehouses).toHaveBeenCalled();
  });

  it('should emit onGeneratePdf with filter values on generatePdf', () => {
    component.search.set('test product');
    component.categoryId.set('cat-1');
    component.warehouseId.set('wh-1');
    component.withStock.set(true);

    component.generatePdf();

    expect(hostComponent.onGeneratePdf).toHaveBeenCalledWith({
      search: 'test product',
      categoryId: 'cat-1',
      warehouseId: 'wh-1',
      withStock: true,
    });
  });

  it('should emit undefined for empty search on generatePdf', () => {
    component.search.set('');
    component.generatePdf();
    expect(hostComponent.onGeneratePdf).toHaveBeenCalledWith({
      search: undefined,
      categoryId: undefined,
      warehouseId: undefined,
      withStock: undefined,
    });
  });

  it('should emit undefined for null signals on generatePdf', () => {
    component.generatePdf();
    expect(hostComponent.onGeneratePdf).toHaveBeenCalledWith({
      search: undefined,
      categoryId: undefined,
      warehouseId: undefined,
      withStock: undefined,
    });
  });

  it('should compute categoryOptions from categoryService.categories', () => {
    mockCategoryService.categories.mockReturnValue([
      { id: 'cat-1', name: 'Electronics' },
      { id: 'cat-2', name: 'Motors' },
    ]);
    mockCategoryService.loadAll.mockReturnValue({ subscribe: vi.fn() });
    mockWarehouseService.simpleWarehouses.mockReturnValue([
      { id: 'wh-1', name: 'Main', state: 'FL' },
    ]);
    mockWarehouseService.loadSimpleWarehouses.mockReturnValue({ subscribe: vi.fn() });

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const localComponent = fixture.debugElement.children[0].componentInstance;

    const options = localComponent.categoryOptions();
    expect(options).toHaveLength(3);
    expect(options[0].label).toBe('Todas las categorías');
    expect(options[1].label).toBe('Electronics');
    expect(options[2].label).toBe('Motors');
  });

  it('should compute warehouseOptions from warehouseService.simpleWarehouses', () => {
    mockCategoryService.categories.mockReturnValue([{ id: 'cat-1', name: 'Test' }]);
    mockCategoryService.loadAll.mockReturnValue({ subscribe: vi.fn() });
    mockWarehouseService.simpleWarehouses.mockReturnValue([
      { id: 'wh-1', name: 'Main', state: 'FL' },
      { id: 'wh-2', name: 'Secondary', state: 'TX' },
    ]);
    mockWarehouseService.loadSimpleWarehouses.mockReturnValue({ subscribe: vi.fn() });

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const localComponent = fixture.debugElement.children[0].componentInstance;

    const options = localComponent.warehouseOptions();
    expect(options).toHaveLength(3);
    expect(options[0].label).toBe('Todos los almacenes');
    expect(options[1].label).toBe('Main (FL)');
    expect(options[2].label).toBe('Secondary (TX)');
  });
});
