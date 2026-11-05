import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { CategoryApiService } from '@features/catalog/categories/services/api/category-api.service';
import { ProductPickerDialogComponent } from '@shared/components/product-picker-dialog/product-picker-dialog.component';
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
    [excludedProductIds]="excludedProductIds"
    [loadProducts]="loader"
    (productsSelected)="onSelected($event)"
    (cancelled)="onCancelled()"
  />`,
  imports: [ProductPickerDialogComponent],
})
class HostComponent {
  visible = false;
  mode: ProductPickerMode = 'sale';
  excludedProductIds: Set<string> = new Set();
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

  it('should update the quantity from the stock popover', () => {
    dialog.onDialogShow();
    dialog.toggleSelection(product);
    dialog.popoverProductId.set('p1');
    dialog.popoverAllocations.set([
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
    dialog.saveAllocation();

    expect(dialog.getAllocationQuantity('p1')).toBe(15);
  });
});
