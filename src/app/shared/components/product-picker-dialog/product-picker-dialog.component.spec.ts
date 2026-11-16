import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { CategoryApiService } from '@features/catalog/categories/services/api/category-api.service';
import { ProductPickerDialogComponent } from '@shared/components/product-picker-dialog/product-picker-dialog.component';
import { SingleWarehouseContext } from '@features/inventory/warehouses/models/interfaces/single-warehouse.interface';
import {
  ProductPickerFilters,
  ProductPickerItem,
  ProductPickerLoader,
  ProductPickerMode,
  ProductPickerPage,
} from '@shared/components/product-picker-dialog/product-picker.models';

const product: ProductPickerItem = {
  id: 'p1',
  code: 'P001',
  name: 'Product One',
  categoryName: 'Category A',
  active: true,
  composite: false,
  price: 100,
  totalStock: 45,
  stockItems: [
    {
      warehouseId: 'wh1',
      warehouseCode: 'WH1',
      warehouseName: 'Warehouse 1',
      quantity: 30,
      reserved: 5,
      available: 25,
    },
    {
      warehouseId: 'wh2',
      warehouseCode: 'WH2',
      warehouseName: 'Warehouse 2',
      quantity: 20,
      reserved: 0,
      available: 20,
    },
  ],
};

const inactiveProduct: ProductPickerItem = {
  ...product,
  id: 'p2',
  code: 'P002',
  name: 'Product Two',
  active: false,
};

const page: ProductPickerPage = {
  content: [product, inactiveProduct],
  totalElements: 2,
  totalPages: 1,
  number: 0,
};

@Component({
  template: `<app-product-picker-dialog
    [visible]="visible"
    [mode]="mode"
    [allowUnlimitedStock]="allowUnlimitedStock"
    [excludedProductIds]="excludedProductIds"
    [singleWarehouse]="singleWarehouse"
    [loadProducts]="loader"
    (productsSelected)="onSelected($event)"
    (cancelled)="onCancelled()"
  />`,
  imports: [ProductPickerDialogComponent],
})
class HostComponent {
  visible = false;
  mode: ProductPickerMode = 'sale';
  allowUnlimitedStock = false;
  excludedProductIds: Set<string> = new Set();
  singleWarehouse: SingleWarehouseContext | null = null;
  loader: ProductPickerLoader = () => of(page);
  onSelected = vi.fn();
  onCancelled = vi.fn();
}

describe('ProductPickerDialogComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let dialog: ProductPickerDialogComponent;
  let loader: ReturnType<typeof vi.fn>;
  let categoryApi: { getAll: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    loader = vi.fn(() => of(page));
    categoryApi = {
      getAll: vi.fn(() => of({ content: [], totalElements: 0, totalPages: 0, number: 0 })),
    };

    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: CategoryApiService, useValue: categoryApi }],
    });

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    host.loader = loader;
    fixture.detectChanges();
    dialog = fixture.debugElement.children[0].componentInstance;
  });

  it('should create with defaults', () => {
    expect(dialog).toBeTruthy();
    expect(dialog.visible()).toBe(false);
    expect(dialog.mode()).toBe('sale');
    expect(dialog.search()).toBe('');
    expect(dialog.products()).toEqual([]);
    expect(dialog.totalPages()).toBe(0);
  });

  it('should load products when the dialog is shown', () => {
    dialog.onDialogShow();

    expect(loader).toHaveBeenCalledWith(
      expect.objectContaining({ page: 0, size: dialog.pageSize }),
    );
    expect(dialog.products()).toEqual([product, inactiveProduct]);
    expect(dialog.totalElements()).toBe(2);
    expect(dialog.totalPages()).toBe(1);
  });

  it('should exclude already added products', () => {
    host.excludedProductIds = new Set(['p1']);
    fixture.detectChanges();
    dialog.onDialogShow();

    expect(dialog.visibleProducts().map((item) => item.id)).toEqual(['p2']);
  });

  it('should pre-allocate available stock for sales', () => {
    dialog.onDialogShow();
    dialog.toggleSelection(product);

    expect(dialog.isSelected('p1')).toBe(true);
    expect(dialog.getAllocationQuantity('p1')).toBe(45);
    expect(dialog.selections().get('p1')?.unitPrice).toBe(100);
  });

  it('should start purchases with zero allocation', () => {
    host.mode = 'purchase';
    fixture.detectChanges();
    dialog.onDialogShow();
    dialog.toggleSelection(product);

    expect(dialog.isSelected('p1')).toBe(true);
    expect(dialog.getAllocationQuantity('p1')).toBe(0);
  });

  it('should apply mode-specific selectability', () => {
    const noStock: ProductPickerItem = { ...product, id: 'p3', stockItems: [] };

    expect(dialog.canSelectProduct(noStock)).toBe(false);
    expect(dialog.canSelectProduct(product)).toBe(true);

    host.mode = 'purchase';
    fixture.detectChanges();

    expect(dialog.canSelectProduct({ ...product, active: false })).toBe(false);
    expect(dialog.canSelectProduct({ ...product, active: true })).toBe(true);
  });

  it('should allow products without stock when stock is unlimited', () => {
    host.allowUnlimitedStock = true;
    fixture.detectChanges();

    expect(dialog.canSelectProduct({ ...product, stockItems: [] })).toBe(true);
  });

  it('should restrict the available stock to the single warehouse', () => {
    host.singleWarehouse = { id: 'wh2', code: 'WH2', name: 'Warehouse 2' };
    fixture.detectChanges();

    expect(dialog.getTotalAvailable(product)).toBe(20);
  });

  it('should hide the product when the single warehouse has no stock', () => {
    host.singleWarehouse = { id: 'wh9', code: 'WH9', name: 'Warehouse 9' };
    fixture.detectChanges();

    expect(dialog.getTotalAvailable(product)).toBe(0);
    expect(dialog.canSelectProduct(product)).toBe(false);
  });

  it('should build entries only for the single warehouse', () => {
    host.singleWarehouse = { id: 'wh2', code: 'WH2', name: 'Warehouse 2' };
    fixture.detectChanges();

    const entries = dialog.stockEntriesFor(product)();

    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual(
      expect.objectContaining({ warehouseId: 'wh2', available: 20, allocated: 0 }),
    );
  });

  it('should start the single warehouse quantity at zero for sales', () => {
    host.singleWarehouse = { id: 'wh2', code: 'WH2', name: 'Warehouse 2' };
    fixture.detectChanges();
    dialog.onDialogShow();
    dialog.toggleSelection(product);

    expect(dialog.isSelected('p1')).toBe(true);
    expect(dialog.getAllocationQuantity('p1')).toBe(0);
  });

  it('should keep the typed quantity when the product is deselected and selected again', () => {
    host.singleWarehouse = { id: 'wh2', code: 'WH2', name: 'Warehouse 2' };
    fixture.detectChanges();
    dialog.onDialogShow();
    dialog.toggleSelection(product);
    dialog.onStockSaved(product, [
      {
        warehouseId: 'wh2',
        warehouseCode: 'WH2',
        warehouseName: 'Warehouse 2',
        quantity: 20,
        reserved: 0,
        available: 20,
        allocated: 7,
      },
    ]);

    dialog.toggleSelection(product);
    dialog.toggleSelection(product);

    expect(dialog.getAllocationQuantity('p1')).toBe(7);
  });

  it('should keep the typed quantity when another product is selected', () => {
    host.singleWarehouse = { id: 'wh2', code: 'WH2', name: 'Warehouse 2' };
    fixture.detectChanges();
    dialog.onDialogShow();
    dialog.toggleSelection(product);
    dialog.onStockSaved(product, [
      {
        warehouseId: 'wh2',
        warehouseCode: 'WH2',
        warehouseName: 'Warehouse 2',
        quantity: 20,
        reserved: 0,
        available: 20,
        allocated: 4,
      },
    ]);
    dialog.toggleSelection(inactiveProduct);

    expect(dialog.getAllocationQuantity('p1')).toBe(4);
  });

  it('should select the product when the direct allocation is set', () => {
    host.singleWarehouse = { id: 'wh2', code: 'WH2', name: 'Warehouse 2' };
    fixture.detectChanges();
    dialog.onDialogShow();

    dialog.onStockSaved(product, [
      {
        warehouseId: 'wh2',
        warehouseCode: 'WH2',
        warehouseName: 'Warehouse 2',
        quantity: 20,
        reserved: 0,
        available: 20,
        allocated: 20,
      },
    ]);

    expect(dialog.isSelected('p1')).toBe(true);
    expect(dialog.getAllocationQuantity('p1')).toBe(20);
  });

  it('should deselect the product when the direct allocation reaches zero', () => {
    host.singleWarehouse = { id: 'wh2', code: 'WH2', name: 'Warehouse 2' };
    fixture.detectChanges();
    dialog.onDialogShow();
    dialog.onStockSaved(product, [
      {
        warehouseId: 'wh2',
        warehouseCode: 'WH2',
        warehouseName: 'Warehouse 2',
        quantity: 20,
        reserved: 0,
        available: 20,
        allocated: 6,
      },
    ]);

    dialog.onStockSaved(product, [
      {
        warehouseId: 'wh2',
        warehouseCode: 'WH2',
        warehouseName: 'Warehouse 2',
        quantity: 20,
        reserved: 0,
        available: 20,
        allocated: 0,
      },
    ]);

    expect(dialog.isSelected('p1')).toBe(false);
    expect(dialog.getAllocationQuantity('p1')).toBe(0);
  });

  it('should fall back to the single warehouse when the product has no stock there', () => {
    host.singleWarehouse = { id: 'wh9', code: 'WH9', name: 'Warehouse 9' };
    fixture.detectChanges();

    const entries = dialog.stockEntriesFor(product)();

    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual(
      expect.objectContaining({ warehouseId: 'wh9', available: 0, allocated: 0 }),
    );
  });

  it('should not send the stock filter when stock is unlimited', () => {
    host.allowUnlimitedStock = true;
    fixture.detectChanges();
    dialog.onDialogShow();

    expect(loader).toHaveBeenLastCalledWith(
      expect.objectContaining({ withStock: undefined, page: 0 }),
    );
  });

  it('should send filters to the loader', () => {
    dialog.onDialogShow();
    dialog.onSearchChange('motor');
    dialog.onCategoryChange('cat1');
    dialog.onCompositeChange(true);
    dialog.onWithStockChange(false);

    expect(loader).toHaveBeenLastCalledWith(
      expect.objectContaining({
        search: 'motor',
        categoryId: 'cat1',
        composite: true,
        withStock: false,
        page: 0,
      }),
    );
  });

  it('should not send the stock filter when purchasing', () => {
    host.mode = 'purchase';
    fixture.detectChanges();
    dialog.onDialogShow();
    dialog.onWithStockChange(false);

    expect(loader).toHaveBeenLastCalledWith(
      expect.objectContaining({ withStock: undefined, page: 0 }),
    );
  });

  it('should emit the selected products', () => {
    dialog.onDialogShow();
    dialog.toggleSelection(product);
    dialog.onAdd();

    expect(host.onSelected).toHaveBeenCalledWith([
      expect.objectContaining({
        product,
        quantity: 45,
        unitPrice: 100,
      }),
    ]);
  });

  it('should emit cancelled', () => {
    dialog.onCancel();
    expect(host.onCancelled).toHaveBeenCalled();
  });

  it('should load categories when the dialog is shown', () => {
    dialog.onDialogShow();
    expect(categoryApi.getAll).toHaveBeenCalled();
  });

  it('should count active filters and clear them', () => {
    dialog.onDialogShow();
    expect(dialog.activeFilterCount()).toBe(0);

    dialog.onCategoryChange('cat1');
    dialog.onCompositeChange(true);
    dialog.onWithStockChange(false);
    expect(dialog.activeFilterCount()).toBe(3);

    dialog.clearFilters();
    expect(dialog.activeFilterCount()).toBe(0);
    expect(loader).toHaveBeenLastCalledWith(
      expect.objectContaining({ categoryId: undefined, composite: undefined, withStock: true }),
    );
  });

  it('should paginate with the requested page', () => {
    const pagedLoader = vi.fn((filters: ProductPickerFilters) =>
      of({ ...page, totalPages: 3, number: filters.page }),
    );
    host.loader = pagedLoader;
    fixture.detectChanges();

    dialog.onDialogShow();
    dialog.onPageNext();
    expect(pagedLoader).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1 }));

    dialog.onPagePrev();
    expect(pagedLoader).toHaveBeenLastCalledWith(expect.objectContaining({ page: 0 }));
  });

  it('should build the stock entries for a product', () => {
    dialog.onDialogShow();
    dialog.toggleSelection(product);
    const entries = dialog.stockEntriesFor(product)();

    expect(entries).toHaveLength(2);
    expect(entries[0].allocated).toBe(25);
    expect(dialog.productLabelFor(product)).toContain('P001');
  });

  it('should apply the stock dialog result to the selection', () => {
    dialog.onDialogShow();
    dialog.toggleSelection(product);
    dialog.onStockSaved(product, [
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
    ]);

    expect(dialog.getAllocationQuantity('p1')).toBe(15);
  });

  it('should remove the selection when the stock dialog is saved with zero', () => {
    dialog.onDialogShow();
    dialog.toggleSelection(product);
    dialog.onStockSaved(product, [
      {
        warehouseId: 'wh1',
        warehouseCode: 'WH1',
        warehouseName: 'Warehouse 1',
        quantity: 30,
        reserved: 5,
        available: 25,
        allocated: 0,
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
    ]);

    expect(dialog.isSelected('p1')).toBe(false);
    expect(dialog.getAllocationQuantity('p1')).toBe(0);
  });

  it('should add the selection when Enter is pressed in the product dialog', () => {
    dialog.onDialogShow();
    dialog.toggleSelection(product);
    dialog.onPickerKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(host.onSelected).toHaveBeenCalled();
  });
});
