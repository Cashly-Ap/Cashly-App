import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { MovementsPdfModalComponent } from '@features/inventory/warehouses/reporting/components/movements-pdf-modal/movements-pdf-modal.component';
import { WarehouseApplicationService } from '@features/inventory/warehouses/services/application/warehouse-application.service';

@Component({
  template: `<app-movements-pdf-modal
    [visible]="visible"
    (visibleChange)="onVisibleChange($event)"
    (onGeneratePdf)="onGeneratePdf($event)"
  ></app-movements-pdf-modal>`,
  imports: [MovementsPdfModalComponent],
})
class HostComponent {
  visible = false;
  onVisibleChange = vi.fn();
  onGeneratePdf = vi.fn();
}

function createMockWarehouseService() {
  return {
    simpleWarehouses: vi.fn(() => []),
    loadSimpleWarehouses: vi.fn(() => ({ subscribe: vi.fn() })),
  };
}

describe('MovementsPdfModalComponent', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let component: MovementsPdfModalComponent;
  let mockWarehouseService: ReturnType<typeof createMockWarehouseService>;

  beforeEach(() => {
    mockWarehouseService = createMockWarehouseService();

    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: WarehouseApplicationService, useValue: mockWarehouseService }],
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

  it('should have default warehouseId signal as null', () => {
    expect(component.warehouseId()).toBeNull();
  });

  it('should have default movementType signal as null', () => {
    expect(component.movementType()).toBeNull();
  });

  it('should have default from signal as null', () => {
    expect(component.from()).toBeNull();
  });

  it('should have default to signal as null', () => {
    expect(component.to()).toBeNull();
  });

  it('should have movementTypeOptions with all types', () => {
    const values = component.movementTypeOptions.map((o) => o.value);
    expect(values).toContain(null);
    expect(values).toContain('ENTRY');
    expect(values).toContain('EXIT');
    expect(values).toContain('ADJUSTMENT');
    expect(values).toContain('TRANSFER_IN');
    expect(values).toContain('TRANSFER_OUT');
    expect(values).toContain('COMPONENT_EXIT');
  });

  it('should call loadSimpleWarehouses when warehouses are empty on init', () => {
    component.loadFilters();
    expect(mockWarehouseService.loadSimpleWarehouses).toHaveBeenCalled();
  });

  it('should compute warehouseOptions from warehouseService.simpleWarehouses', () => {
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

describe('MovementsPdfModalComponent - visible', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let component: MovementsPdfModalComponent;
  let mockWarehouseService: ReturnType<typeof createMockWarehouseService>;

  beforeEach(() => {
    mockWarehouseService = createMockWarehouseService();

    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: WarehouseApplicationService, useValue: mockWarehouseService }],
    });

    TestBed.compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.visible = true;
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should have visible input as true', () => {
    expect(component.visible()).toBe(true);
  });

  it('should emit onGeneratePdf with filter values on generatePdf', () => {
    component.warehouseId.set('wh-1');
    component.movementType.set('ENTRY');
    component.from.set(new Date(2025, 0, 1));
    component.to.set(new Date(2025, 11, 31));

    component.generatePdf();

    expect(hostComponent.onGeneratePdf).toHaveBeenCalledWith({
      warehouseId: 'wh-1',
      movementType: 'ENTRY',
      from: '2025-01-01',
      to: '2025-12-31',
    });
  });

  it('should emit undefined for null/empty signals on generatePdf', () => {
    component.generatePdf();
    expect(hostComponent.onGeneratePdf).toHaveBeenCalledWith({
      warehouseId: undefined,
      movementType: undefined,
      from: undefined,
      to: undefined,
    });
  });

  it('should compute warehouseOptions from warehouseService.simpleWarehouses', () => {
    mockWarehouseService.simpleWarehouses.mockReturnValue([
      { id: 'wh-1', name: 'Main', state: 'FL' },
    ]);
    mockWarehouseService.loadSimpleWarehouses.mockReturnValue({ subscribe: vi.fn() });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.visible = true;
    fixture.detectChanges();
    const localComponent = fixture.debugElement.children[0].componentInstance;

    const options = localComponent.warehouseOptions();
    expect(options).toHaveLength(2);
    expect(options[0].label).toBe('Todos los almacenes');
    expect(options[1].label).toBe('Main (FL)');
  });
});
