import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WarehouseStockDialogComponent } from '@shared/components/warehouse-stock-dialog/warehouse-stock-dialog.component';
import { WarehouseStockEntry } from '@shared/components/warehouse-stock-dialog/warehouse-stock-entry.interface';

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
  {
    warehouseId: 'wh2',
    warehouseCode: 'WH2',
    warehouseName: 'Warehouse 2',
    quantity: 20,
    reserved: 0,
    available: 20,
    allocated: 0,
  },
];

@Component({
  template: `<app-warehouse-stock-dialog
    [(visible)]="visible"
    [entries]="entries"
    [productLabel]="productLabel"
    [showStockDetails]="showStockDetails"
    [unlimited]="unlimited"
    (saved)="onSaved($event)"
  />`,
  imports: [WarehouseStockDialogComponent],
})
class HostComponent {
  visible = false;
  entries = entries;
  productLabel: string | null = 'P001 — Product One';
  showStockDetails = true;
  unlimited = false;
  onSaved = vi.fn();
}

describe('WarehouseStockDialogComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let dialog: WarehouseStockDialogComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    dialog = fixture.debugElement.children[0].componentInstance;
  });

  it('should create with the expected defaults', () => {
    expect(dialog).toBeTruthy();
    expect(dialog.visible()).toBe(false);
    expect(dialog.showStockDetails()).toBe(true);
    expect(dialog.unlimited()).toBe(false);
  });

  it('should start the draft from the given entries', () => {
    expect(dialog.draft()).toHaveLength(2);
    expect(dialog.draft()[0].allocated).toBe(5);
    expect(dialog.total()).toBe(5);
  });

  it('should update allocations and the total', () => {
    dialog.updateAllocation(0, 10);
    dialog.updateAllocation(1, 5);

    expect(dialog.total()).toBe(15);
    expect(dialog.draft()[0].allocated).toBe(10);
  });

  it('should clamp allocations above the available stock', () => {
    dialog.updateAllocation(0, 500);

    expect(dialog.draft()[0].allocated).toBe(25);
  });

  it('should clamp allocations when saving', () => {
    dialog.draft.set([
      { ...entries[0], allocated: 500 },
      { ...entries[1], allocated: 500 },
    ]);

    dialog.save();

    expect(host.onSaved).toHaveBeenCalledWith([
      expect.objectContaining({ warehouseId: 'wh1', allocated: 25 }),
      expect.objectContaining({ warehouseId: 'wh2', allocated: 20 }),
    ]);
  });

  it('should emit the allocations and close when saving', () => {
    dialog.updateAllocation(1, 7);
    dialog.save();

    expect(host.onSaved).toHaveBeenCalledWith([
      expect.objectContaining({ warehouseId: 'wh1', allocated: 5 }),
      expect.objectContaining({ warehouseId: 'wh2', allocated: 7 }),
    ]);
    expect(dialog.visible()).toBe(false);
  });

  it('should close without emitting when there are no entries', () => {
    host.entries = [];
    fixture.detectChanges();

    dialog.save();

    expect(host.onSaved).not.toHaveBeenCalled();
    expect(dialog.visible()).toBe(false);
  });

  it('should save when Enter is pressed', () => {
    dialog.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(host.onSaved).toHaveBeenCalled();
  });
});
