import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StockAllocationButtonComponent } from '@shared/components/stock-allocation-button/stock-allocation-button.component';
import { WarehouseStockEntry } from '@shared/components/warehouse-stock-dialog/warehouse-stock-entry.interface';
import { SingleWarehouseContext } from '@features/inventory/warehouses/models/interfaces/single-warehouse.interface';

const entries: WarehouseStockEntry[] = [
  {
    warehouseId: 'wh1',
    warehouseCode: 'WH1',
    warehouseName: 'Warehouse 1',
    quantity: 30,
    reserved: 5,
    available: 25,
    allocated: 5,
  },
];

@Component({
  template: `<app-stock-allocation-button
    [buildEntries]="builder"
    [productLabel]="productLabel"
    [showStockDetails]="showStockDetails"
    [unlimited]="unlimited"
    [singleWarehouse]="singleWarehouse"
    (saved)="onSaved($event)"
  />`,
  imports: [StockAllocationButtonComponent],
})
class HostComponent {
  builder = () => entries;
  productLabel: string | null = 'P001 — Product One';
  showStockDetails = true;
  unlimited = false;
  singleWarehouse: SingleWarehouseContext | null = null;
  onSaved = vi.fn();
}

describe('StockAllocationButtonComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let button: StockAllocationButtonComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    button = fixture.debugElement.children[0].componentInstance;
  });

  it('should create with defaults', () => {
    expect(button).toBeTruthy();
    expect(button.dialogVisible()).toBe(false);
    expect(button.showStockDetails()).toBe(true);
    expect(button.unlimited()).toBe(false);
  });

  it('should build the entries and open the dialog', () => {
    fixture.detectChanges();
    button.open(new MouseEvent('click'));

    expect(button.dialogVisible()).toBe(true);
    expect(button.dialogEntries()).toEqual(entries);
  });

  it('should clone the built entries', () => {
    fixture.detectChanges();
    button.open(new MouseEvent('click'));

    expect(button.dialogEntries()[0]).not.toBe(entries[0]);
  });

  it('should emit the saved entries', () => {
    button.onSaved(entries);

    expect(host.onSaved).toHaveBeenCalledWith(entries);
  });

  it('should expose the allocated quantity for a single warehouse', () => {
    host.singleWarehouse = { id: 'wh1', code: 'WH1', name: 'Warehouse 1' };
    fixture.detectChanges();

    expect(button.singleEntry()?.warehouseId).toBe('wh1');
    expect(button.singleAllocated()).toBe(5);
    expect(button.singleMax()).toBe(25);
  });

  it('should emit a single allocation when the inline input changes', () => {
    host.singleWarehouse = { id: 'wh1', code: 'WH1', name: 'Warehouse 1' };
    fixture.detectChanges();

    button.onInlineChange(12);

    expect(host.onSaved).toHaveBeenCalledWith([
      expect.objectContaining({ warehouseId: 'wh1', allocated: 12 }),
    ]);
  });

  it('should clamp the inline allocation to the available stock', () => {
    host.singleWarehouse = { id: 'wh1', code: 'WH1', name: 'Warehouse 1' };
    fixture.detectChanges();

    button.onInlineChange(999);

    expect(host.onSaved).toHaveBeenCalledWith([
      expect.objectContaining({ warehouseId: 'wh1', allocated: 25 }),
    ]);
  });
});
