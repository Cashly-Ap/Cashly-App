import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { WarehouseStockPopoverComponent } from './warehouse-stock-popover.component';
import { WarehouseStockEntry } from './warehouse-stock-entry.interface';

@Component({
  template: `<app-warehouse-stock-popover [entries]="entries" [total]="total" [confirmLabel]="confirmLabel" [emptyMessage]="emptyMessage" (allocationChange)="onAllocationChange($event)" (confirm)="onConfirm()"></app-warehouse-stock-popover>`,
  imports: [WarehouseStockPopoverComponent],
})
class HostComponent {
  entries: WarehouseStockEntry[] = [];
  total = 0;
  confirmLabel = 'Guardar';
  emptyMessage = 'Sin almacenes disponibles';
  onAllocationChange = vi.fn();
  onConfirm = vi.fn();
}

describe('WarehouseStockPopoverComponent', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let component: WarehouseStockPopoverComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default entries as empty array', () => {
    expect(component.entries()).toEqual([]);
  });

  it('should have default total as 0', () => {
    expect(component.total()).toBe(0);
  });

  it('should have default confirmLabel as Guardar', () => {
    expect(component.confirmLabel()).toBe('Guardar');
  });

  it('should have default emptyMessage as Sin almacenes disponibles', () => {
    expect(component.emptyMessage()).toBe('Sin almacenes disponibles');
  });
});

describe('WarehouseStockPopoverComponent - with entries', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let component: WarehouseStockPopoverComponent;

  const mockEntries: WarehouseStockEntry[] = [
    {
      warehouseId: 'wh1',
      warehouseCode: 'WH1',
      warehouseName: 'Warehouse 1',
      quantity: 30,
      reserved: 5,
      available: 25,
      allocated: 10,
    },
    {
      warehouseId: 'wh2',
      warehouseCode: 'WH2',
      warehouseName: 'Warehouse 2',
      quantity: 20,
      reserved: 0,
      available: 20,
      allocated: 5,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.entries = mockEntries;
    hostComponent.total = 15;
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should have entries set', () => {
    expect(component.entries()).toHaveLength(2);
    expect(component.entries()[0].warehouseName).toBe('Warehouse 1');
  });

  it('should have total set', () => {
    expect(component.total()).toBe(15);
  });

  it('should emit allocationChange with index and value', () => {
    component.onValueChange(0, 15);
    expect(hostComponent.onAllocationChange).toHaveBeenCalledWith({ index: 0, value: 15 });
  });

  it('should emit allocationChange for second entry', () => {
    component.onValueChange(1, 8);
    expect(hostComponent.onAllocationChange).toHaveBeenCalledWith({ index: 1, value: 8 });
  });

  it('should emit confirm', () => {
    component.confirm.emit();
    expect(hostComponent.onConfirm).toHaveBeenCalled();
  });
});

describe('WarehouseStockPopoverComponent - custom labels', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let component: WarehouseStockPopoverComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.confirmLabel = 'Confirmar';
    hostComponent.emptyMessage = 'No hay stock';
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should have custom confirmLabel', () => {
    expect(component.confirmLabel()).toBe('Confirmar');
  });

  it('should have custom emptyMessage', () => {
    expect(component.emptyMessage()).toBe('No hay stock');
  });
});

describe('WarehouseStockPopoverComponent - empty state', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let component: WarehouseStockPopoverComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.entries = [];
    hostComponent.emptyMessage = 'No warehouses';
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should have empty entries', () => {
    expect(component.entries()).toEqual([]);
  });

  it('should have emptyMessage available', () => {
    expect(component.emptyMessage()).toBe('No warehouses');
  });
});
