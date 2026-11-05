import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PurchaseItemsTableComponent } from '@features/procurement/purchases/components/purchase-items-table/purchase-items-table.component';
import { PurchaseLineFormData } from '@features/procurement/purchases/models/interfaces/purchase-form-data.interface';
import { SingleWarehouseContext } from '@features/inventory/warehouses/models/interfaces/single-warehouse.interface';
import { WarehouseAllocation } from '@features/sales/orders/models/interfaces/order-item-allocation.interface';

const allocation = (warehouseId: string): WarehouseAllocation => ({
  warehouseId,
  warehouseCode: warehouseId.toUpperCase(),
  warehouseName: warehouseId,
  available: 10,
  allocated: 1,
});

const line = (allocations: WarehouseAllocation[]): PurchaseLineFormData => ({
  productId: 'p1',
  productCode: 'P1',
  productName: 'Product 1',
  quantity: 2,
  unitCost: 100,
  stock: [],
  warehouseAllocations: allocations,
});

@Component({
  template: `<app-purchase-items-table
    [items]="items"
    [readonly]="readonly"
    [singleWarehouse]="singleWarehouse"
    (itemsChange)="onItemsChange($event)"
  />`,
  imports: [PurchaseItemsTableComponent],
})
class HostComponent {
  items: PurchaseLineFormData[] = [];
  readonly = false;
  singleWarehouse: SingleWarehouseContext | null = null;
  onItemsChange = vi.fn();
}

describe('PurchaseItemsTableComponent', () => {
  let component: PurchaseItemsTableComponent;

  const build = (warehouse: SingleWarehouseContext | null): void => {
    const fixture: ComponentFixture<HostComponent> = TestBed.createComponent(HostComponent);
    fixture.componentInstance.singleWarehouse = warehouse;
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  it('should expose the single warehouse for a line without allocations', () => {
    build({ id: 'wh1', code: 'WH1', name: 'Warehouse 1' });

    expect(component.warehouseForItem(line([]))).toEqual({
      id: 'wh1',
      code: 'WH1',
      name: 'Warehouse 1',
    });
  });

  it('should keep the single warehouse while the line has one allocation', () => {
    build({ id: 'wh1', code: 'WH1', name: 'Warehouse 1' });

    expect(component.warehouseForItem(line([allocation('wh1')]))).not.toBeNull();
  });

  it('should fall back to the dialog when the line has several allocations', () => {
    build({ id: 'wh1', code: 'WH1', name: 'Warehouse 1' });

    expect(component.warehouseForItem(line([allocation('wh1'), allocation('wh2')]))).toBeNull();
  });

  it('should fall back to the dialog without a single warehouse', () => {
    build(null);

    expect(component.warehouseForItem(line([]))).toBeNull();
  });
});
