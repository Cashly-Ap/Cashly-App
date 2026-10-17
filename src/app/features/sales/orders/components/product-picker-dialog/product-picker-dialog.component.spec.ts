import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ProductPickerDialogComponent } from '@features/sales/orders/components/product-picker-dialog/product-picker-dialog.component';
import { OrderApiService } from '@features/sales/orders/services/api/order-api.service';
import { CategoryApiService } from '@features/catalog/categories/services/api/category-api.service';
import { OrderProduct } from '@features/sales/orders/models/interfaces/order-product.interface';
import { CategoryList } from '@features/catalog/categories/models/interfaces/category-list.interface';

@Component({
  template: `<app-product-picker-dialog
    [visible]="visible"
    [customerId]="customerId"
    [excludedProductIds]="excludedProductIds"
    (productsAdded)="onProductsAdded($event)"
    (cancelled)="onCancelled()"
  ></app-product-picker-dialog>`,
  imports: [ProductPickerDialogComponent],
})
class HostComponent {
  visible = false;
  customerId = 'c1';
  excludedProductIds: Set<string> = new Set();
  onProductsAdded = vi.fn();
  onCancelled = vi.fn();
}

describe('ProductPickerDialogComponent', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialog: ProductPickerDialogComponent;
  let mockOrderApi: Partial<OrderApiService>;
  let mockCategoryApi: Partial<CategoryApiService>;

  const mockProducts: OrderProduct[] = [
    {
      id: 'p1',
      code: 'P001',
      name: 'Product One',
      categoryName: 'Category A',
      customerPrice: 100,
      totalStock: 50,
      stock: [
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
    },
  ];

  const mockCategories: CategoryList[] = [
    { id: 'cat1', name: 'Category A', active: true },
    { id: 'cat2', name: 'Category B', active: true },
  ];

  const mockProductPage = {
    content: mockProducts,
    totalElements: 1,
    totalPages: 1,
    number: 0,
  };

  const mockCategoryPage = {
    content: mockCategories,
    totalElements: 2,
    totalPages: 1,
    number: 0,
  };

  beforeEach(() => {
    mockOrderApi = {
      getProductsForOrder: vi.fn().mockReturnValue(of(mockProductPage)),
    };
    mockCategoryApi = {
      getAll: vi.fn().mockReturnValue(of(mockCategoryPage)),
    };

    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: OrderApiService, useValue: mockOrderApi },
        { provide: CategoryApiService, useValue: mockCategoryApi },
      ],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    dialog = fixture.debugElement.children[0].componentInstance;
  });

  it('should create', () => {
    expect(dialog).toBeTruthy();
  });

  it('should have default visible input as false', () => {
    expect(dialog.visible()).toBe(false);
  });

  it('should have default search as empty string', () => {
    expect(dialog.search()).toBe('');
  });

  it('should have default products as empty array', () => {
    expect(dialog.products()).toEqual([]);
  });

  it('should have default loading as false', () => {
    expect(dialog.loading()).toBe(false);
  });

  it('should have default selectedIds as empty set', () => {
    expect(dialog.selectedIds()).toEqual(new Set());
  });

  it('should have default selections as empty map', () => {
    expect(dialog.selections()).toEqual(new Map());
  });

  it('should have default filterWithStock as true', () => {
    expect(dialog.filterWithStock()).toBe(true);
  });

  it('should have default filterCategoryId as null', () => {
    expect(dialog.filterCategoryId()).toBeNull();
  });

  it('should have default filterComposite as null', () => {
    expect(dialog.filterComposite()).toBeNull();
  });

  it('should have pageSize of 10', () => {
    expect(dialog.pageSize).toBe(10);
  });

  it('should have compositeOptions', () => {
    expect(dialog.compositeOptions).toHaveLength(3);
    expect(dialog.compositeOptions[0].label).toBe('Todos los tipos');
    expect(dialog.compositeOptions[1].label).toBe('Simple');
    expect(dialog.compositeOptions[2].label).toBe('Compuesto');
  });

  it('should have withStockOptions', () => {
    expect(dialog.withStockOptions).toHaveLength(2);
    expect(dialog.withStockOptions[0].label).toBe('Con stock');
    expect(dialog.withStockOptions[1].label).toBe('Sin stock');
  });

  it('should have selectedCount as 0', () => {
    expect(dialog.selectedCount()).toBe(0);
  });

  it('should have activeFilterCount as 0 by default', () => {
    expect(dialog.activeFilterCount()).toBe(0);
  });

  it('should have activeFilterCount as 1 when category filter set', () => {
    dialog.filterCategoryId.set('cat1');
    expect(dialog.activeFilterCount()).toBe(1);
  });

  it('should have activeFilterCount as 1 when composite filter set', () => {
    dialog.filterComposite.set(false);
    expect(dialog.activeFilterCount()).toBe(1);
  });

  it('should have activeFilterCount as 1 when withStock is false', () => {
    dialog.filterWithStock.set(false);
    expect(dialog.activeFilterCount()).toBe(1);
  });

  it('should have activeFilterCount as 3 when all filters active', () => {
    dialog.filterCategoryId.set('cat1');
    dialog.filterComposite.set(false);
    dialog.filterWithStock.set(false);
    expect(dialog.activeFilterCount()).toBe(3);
  });

  it('should emit cancelled on cancel', () => {
    dialog.onCancel();
    expect(hostComponent.onCancelled).toHaveBeenCalled();
  });

  it('should return false for isSelected when product not selected', () => {
    expect(dialog.isSelected('p1')).toBe(false);
  });

  it('should return true for isSelected when product selected', () => {
    dialog.selectedIds.set(new Set(['p1']));
    expect(dialog.isSelected('p1')).toBe(true);
  });

  it('should calculate getTotalAvailable', () => {
    const total = dialog.getTotalAvailable(mockProducts[0]);
    expect(total).toBe(45);
  });

  it('should calculate getTotalReserved', () => {
    const total = dialog.getTotalReserved(mockProducts[0]);
    expect(total).toBe(5);
  });

  it('should return 0 for getAllocationQuantity when not selected', () => {
    expect(dialog.getAllocationQuantity('p1')).toBe(0);
  });
});

describe('ProductPickerDialogComponent - visible', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialog: ProductPickerDialogComponent;
  let mockOrderApi: Partial<OrderApiService>;
  let mockCategoryApi: Partial<CategoryApiService>;

  const mockProducts: OrderProduct[] = [
    {
      id: 'p1',
      code: 'P001',
      name: 'Product One',
      categoryName: 'Category A',
      customerPrice: 100,
      totalStock: 50,
      stock: [
        {
          warehouseId: 'wh1',
          warehouseCode: 'WH1',
          warehouseName: 'Warehouse 1',
          quantity: 30,
          reserved: 5,
          available: 25,
        },
      ],
    },
  ];

  const mockCategories: CategoryList[] = [{ id: 'cat1', name: 'Category A', active: true }];

  const mockProductPage = {
    content: mockProducts,
    totalElements: 1,
    totalPages: 1,
    number: 0,
  };

  const mockCategoryPage = {
    content: mockCategories,
    totalElements: 1,
    totalPages: 1,
    number: 0,
  };

  beforeEach(() => {
    mockOrderApi = {
      getProductsForOrder: vi.fn().mockReturnValue(of(mockProductPage)),
    };
    mockCategoryApi = {
      getAll: vi.fn().mockReturnValue(of(mockCategoryPage)),
    };

    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: OrderApiService, useValue: mockOrderApi },
        { provide: CategoryApiService, useValue: mockCategoryApi },
      ],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.visible = true;
    fixture.detectChanges();
    dialog = fixture.debugElement.children[0].componentInstance;
  });

  it('should load products and categories on dialog show', () => {
    expect(mockOrderApi.getProductsForOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: 'c1',
        page: 0,
        size: 10,
        withStock: true,
      }),
    );
    expect(mockCategoryApi.getAll).toHaveBeenCalledWith({ active: true, size: 100 });
  });

  it('should set products after loading', async () => {
    await fixture.whenStable();
    expect(dialog.products()).toHaveLength(1);
    expect(dialog.products()[0].name).toBe('Product One');
  });

  it('should set categories after loading', async () => {
    await fixture.whenStable();
    expect(dialog.categories()).toHaveLength(1);
    expect(dialog.categories()[0].name).toBe('Category A');
  });

  it('should set loading to false after success', async () => {
    await fixture.whenStable();
    expect(dialog.loading()).toBe(false);
  });

  it('should set loading to false on product load error', async () => {
    mockOrderApi.getProductsForOrder = vi
      .fn()
      .mockReturnValue(throwError(() => new Error('Failed')));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: OrderApiService, useValue: mockOrderApi },
        { provide: CategoryApiService, useValue: mockCategoryApi },
      ],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.visible = true;
    fixture.detectChanges();
    dialog = fixture.debugElement.children[0].componentInstance;
    await fixture.whenStable();

    expect(dialog.loading()).toBe(false);
  });

  it('should only load once on multiple dialog shows', () => {
    dialog.onDialogShow();
    expect(mockOrderApi.getProductsForOrder).toHaveBeenCalledTimes(1);
  });

  it('should reset selection state on dialog show', () => {
    dialog.search.set('test');
    dialog.currentPage.set(2);
    dialog.selectedIds.set(new Set(['p1']));
    dialog.onDialogShow();
    expect(dialog.search()).toBe('');
    expect(dialog.currentPage()).toBe(0);
    expect(dialog.selectedIds()).toEqual(new Set());
    expect(dialog.selections()).toEqual(new Map());
  });

  it('should reset initialized when customerId changes', () => {
    dialog.onDialogShow();
    expect(dialog['initialized']).toBe(true);
    hostComponent.customerId = 'c2';
    fixture.detectChanges();
    dialog.onDialogShow();
    expect(mockOrderApi.getProductsForOrder).toHaveBeenCalledTimes(2);
  });
});

describe('ProductPickerDialogComponent - selection', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialog: ProductPickerDialogComponent;
  let mockOrderApi: Partial<OrderApiService>;
  let mockCategoryApi: Partial<CategoryApiService>;

  const mockProducts: OrderProduct[] = [
    {
      id: 'p1',
      code: 'P001',
      name: 'Product One',
      categoryName: 'Category A',
      customerPrice: 100,
      totalStock: 50,
      stock: [
        {
          warehouseId: 'wh1',
          warehouseCode: 'WH1',
          warehouseName: 'Warehouse 1',
          quantity: 30,
          reserved: 5,
          available: 25,
        },
      ],
    },
    {
      id: 'p2',
      code: 'P002',
      name: 'Product Two',
      categoryName: 'Category A',
      customerPrice: 200,
      totalStock: 0,
      stock: [
        {
          warehouseId: 'wh1',
          warehouseCode: 'WH1',
          warehouseName: 'Warehouse 1',
          quantity: 0,
          reserved: 0,
          available: 0,
        },
      ],
    },
  ];

  const mockProductPage = {
    content: mockProducts,
    totalElements: 2,
    totalPages: 1,
    number: 0,
  };

  const mockCategoryPage = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
  };

  beforeEach(() => {
    mockOrderApi = {
      getProductsForOrder: vi.fn().mockReturnValue(of(mockProductPage)),
    };
    mockCategoryApi = {
      getAll: vi.fn().mockReturnValue(of(mockCategoryPage)),
    };

    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: OrderApiService, useValue: mockOrderApi },
        { provide: CategoryApiService, useValue: mockCategoryApi },
      ],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.visible = true;
    fixture.detectChanges();
    dialog = fixture.debugElement.children[0].componentInstance;
  });

  it('should select product with available stock', () => {
    dialog.toggleSelection(mockProducts[0]);
    expect(dialog.selectedIds()).toContain('p1');
    expect(dialog.selections().has('p1')).toBe(true);
  });

  it('should not select product without stock', () => {
    dialog.toggleSelection(mockProducts[1]);
    expect(dialog.selectedIds()).not.toContain('p2');
  });

  it('should deselect product when toggled again', () => {
    dialog.toggleSelection(mockProducts[0]);
    expect(dialog.selectedIds()).toContain('p1');
    dialog.toggleSelection(mockProducts[0]);
    expect(dialog.selectedIds()).not.toContain('p1');
    expect(dialog.selections().has('p1')).toBe(false);
  });

  it('should filter out excluded products from visibleProducts', () => {
    hostComponent.excludedProductIds = new Set(['p1']);
    fixture.detectChanges();
    const visible = dialog.visibleProducts();
    expect(visible).toHaveLength(1);
    expect(visible[0].id).toBe('p2');
  });

  it('should emit productsAdded with correct items', () => {
    dialog.toggleSelection(mockProducts[0]);
    dialog.onAdd();
    expect(hostComponent.onProductsAdded).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          productId: 'p1',
          productCode: 'P001',
          productName: 'Product One',
          quantity: 25,
          unitPrice: 100,
        }),
      ]),
    );
  });

  it('should not emit productsAdded when no selections', () => {
    dialog.onAdd();
    expect(hostComponent.onProductsAdded).toHaveBeenCalledWith([]);
  });
});

describe('ProductPickerDialogComponent - filters', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let dialog: ProductPickerDialogComponent;
  let mockOrderApi: Partial<OrderApiService>;
  let mockCategoryApi: Partial<CategoryApiService>;

  const mockProductPage = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
  };

  const mockCategoryPage = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
  };

  beforeEach(() => {
    mockOrderApi = {
      getProductsForOrder: vi.fn().mockReturnValue(of(mockProductPage)),
    };
    mockCategoryApi = {
      getAll: vi.fn().mockReturnValue(of(mockCategoryPage)),
    };

    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: OrderApiService, useValue: mockOrderApi },
        { provide: CategoryApiService, useValue: mockCategoryApi },
      ],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.visible = true;
    fixture.detectChanges();
    dialog = fixture.debugElement.children[0].componentInstance;
  });

  it('should load with search on search change', () => {
    dialog.onSearchChange('motor');
    expect(mockOrderApi.getProductsForOrder).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'motor', page: 0 }),
    );
  });

  it('should load with category filter', () => {
    dialog.onCategoryChange('cat1');
    expect(mockOrderApi.getProductsForOrder).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: 'cat1', page: 0 }),
    );
  });

  it('should load with composite filter', () => {
    dialog.onCompositeChange(false);
    expect(mockOrderApi.getProductsForOrder).toHaveBeenCalledWith(
      expect.objectContaining({ composite: false, page: 0 }),
    );
  });

  it('should load with stock filter', () => {
    dialog.onWithStockChange(false);
    expect(mockOrderApi.getProductsForOrder).toHaveBeenCalledWith(
      expect.objectContaining({ withStock: false, page: 0 }),
    );
  });

  it('should clear all filters', () => {
    dialog.filterCategoryId.set('cat1');
    dialog.filterComposite.set(true);
    dialog.filterWithStock.set(false);
    dialog.clearFilters();
    expect(dialog.filterCategoryId()).toBeNull();
    expect(dialog.filterComposite()).toBeNull();
    expect(dialog.filterWithStock()).toBe(true);
  });

  it('should load previous page', () => {
    dialog.currentPage.set(2);
    dialog.onPagePrev();
    expect(mockOrderApi.getProductsForOrder).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1 }),
    );
  });

  it('should not load previous page when on first page', () => {
    dialog.currentPage.set(0);
    dialog.onPagePrev();
    expect(mockOrderApi.getProductsForOrder).toHaveBeenCalledTimes(1);
  });

  it('should load next page', () => {
    dialog.totalPages.set(3);
    dialog.currentPage.set(0);
    dialog.onPageNext();
    expect(mockOrderApi.getProductsForOrder).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1 }),
    );
  });

  it('should not load next page when on last page', () => {
    dialog.totalPages.set(3);
    dialog.currentPage.set(2);
    dialog.onPageNext();
    expect(mockOrderApi.getProductsForOrder).toHaveBeenCalledTimes(1);
  });

  it('should have categoryOptions computed', async () => {
    await fixture.whenStable();
    const options = dialog.categoryOptions();
    expect(options[0].label).toBe('Todas las categorías');
    expect(options[0].value).toBeNull();
  });
});
