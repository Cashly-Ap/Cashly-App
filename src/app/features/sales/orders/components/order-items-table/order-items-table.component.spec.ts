import { provideRouter } from '@angular/router';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NO_ERRORS_SCHEMA, Component } from '@angular/core';
import { OrderItemsTableComponent } from '@features/sales/orders/components/order-items-table/order-items-table.component';
import { OrderItemFormData } from '@features/sales/orders/models/interfaces/order-form-data.interface';
import { ProductList } from '@features/catalog/products/models/interfaces/product-list.interface';
import { ProductPickerSelection } from '@shared/components/product-picker-dialog/product-picker.models';
import { SingleWarehouseContext } from '@features/inventory/warehouses/models/interfaces/single-warehouse.interface';
import { WarehouseAllocation } from '@features/sales/orders/models/interfaces/order-item-allocation.interface';

const allocation = (warehouseId: string): WarehouseAllocation => ({
  warehouseId,
  warehouseCode: warehouseId.toUpperCase(),
  warehouseName: warehouseId,
  available: 10,
  allocated: 1,
});

const mockAllocationItem = (allocations: WarehouseAllocation[]): OrderItemFormData => ({
  productId: 'p1',
  productCode: 'P1',
  productName: 'Product 1',
  stock: [],
  quantity: 2,
  unitPrice: 100,
  warehouseAllocations: allocations,
});

@Component({
  template: `<app-order-items-table
    [context]="context"
    [items]="items"
    [products]="products"
    [customerId]="customerId"
    [readonly]="readonly"
    [singleWarehouse]="singleWarehouse"
    (itemsChange)="onItemsChange($event)"
  ></app-order-items-table>`,
  imports: [OrderItemsTableComponent],
})
class HostComponent {
  context: 'order' | 'invoice' | 'quote' = 'order';
  items: OrderItemFormData[] = [];
  products: ProductList[] = [];
  customerId: string | null = null;
  readonly = false;
  singleWarehouse: SingleWarehouseContext | null = null;
  onItemsChange = vi.fn();
}

describe('OrderItemsTableComponent', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let component: OrderItemsTableComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthorizationService, useValue: { can: () => true } },
      ],
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  });

  const recreateWithSingleWarehouse = (warehouse: SingleWarehouseContext): void => {
    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.singleWarehouse = warehouse;
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default context as order', () => {
    expect(component.context()).toBe('order');
  });

  it('should have default items as empty array', () => {
    expect(component.items()).toEqual([]);
  });

  it('should have default products as empty array', () => {
    expect(component.products()).toEqual([]);
  });

  it('should have default customerId as null', () => {
    expect(component.customerId()).toBeNull();
  });

  it('should have default readonly as false', () => {
    expect(component.readonly()).toBe(false);
  });

  it('should have default pickerVisible as false', () => {
    expect(component.pickerVisible()).toBe(false);
  });

  it('should have titleLabel for order context', () => {
    expect(component.titleLabel()).toBe('sales.orders.orderLines');
  });

  it('should have totalLabel for order context', () => {
    expect(component.totalLabel()).toBe('sales.orders.orderTotal');
  });

  it('should calculate total as 0 for empty items', () => {
    expect(component.total()).toBe(0);
  });

  it('should not open picker without customerId', () => {
    component.openPicker();
    expect(component.pickerVisible()).toBe(false);
  });

  it('should close picker on products added and emit itemsChange', () => {
    const newItems: ProductPickerSelection[] = [
      {
        product: {
          id: 'p1',
          code: 'P1',
          name: 'Product 1',
          categoryName: 'Category',
          active: true,
          price: 100,
          totalStock: 0,
          stockItems: [],
        },
        quantity: 1,
        unitPrice: 100,
        allocations: [],
      },
    ];
    component.onProductsAdded(newItems);
    expect(component.pickerVisible()).toBe(false);
    expect(hostComponent.onItemsChange).toHaveBeenCalledWith([
      expect.objectContaining({ productId: 'p1', quantity: 1, unitPrice: 100 }),
    ]);
  });

  it('should close picker on cancel', () => {
    component.pickerVisible.set(true);
    component.onPickerCancelled();
    expect(component.pickerVisible()).toBe(false);
  });

  it('should return productId when product not found', () => {
    expect(component.resolveProductName('unknown')).toBe('unknown');
  });

  it('should return null for resolveProductStock when not found', () => {
    expect(component.resolveProductStock('unknown')).toBeNull();
  });

  it('should calculate getItemTotalReserved', () => {
    const item: OrderItemFormData = {
      productId: 'p1',
      productCode: 'P1',
      productName: 'Product 1',
      stock: [
        {
          warehouseId: 'wh1',
          warehouseCode: 'WH1',
          warehouseName: 'WH1',
          quantity: 10,
          reserved: 3,
          available: 7,
        },
        {
          warehouseId: 'wh2',
          warehouseCode: 'WH2',
          warehouseName: 'WH2',
          quantity: 20,
          reserved: 5,
          available: 15,
        },
      ],
      quantity: 1,
      unitPrice: 100,
      warehouseAllocations: [],
    };
    expect(component.getItemTotalReserved(item)).toBe(8);
  });

  it('should calculate getItemTotalReserved with undefined stock', () => {
    const item: OrderItemFormData = {
      productId: 'p1',
      productCode: 'P1',
      productName: 'Product 1',
      stock: undefined as any,
      quantity: 1,
      unitPrice: 100,
      warehouseAllocations: [],
    };
    expect(component.getItemTotalReserved(item)).toBe(0);
  });

  it('should calculate getItemTotalAvailable', () => {
    const item: OrderItemFormData = {
      productId: 'p1',
      productCode: 'P1',
      productName: 'Product 1',
      stock: [
        {
          warehouseId: 'wh1',
          warehouseCode: 'WH1',
          warehouseName: 'WH1',
          quantity: 10,
          reserved: 3,
          available: 7,
        },
        {
          warehouseId: 'wh2',
          warehouseCode: 'WH2',
          warehouseName: 'WH2',
          quantity: 20,
          reserved: 5,
          available: 15,
        },
      ],
      quantity: 1,
      unitPrice: 100,
      warehouseAllocations: [],
    };
    expect(component.getItemTotalAvailable(item)).toBe(22);
  });

  it('should detect over-allocated item', () => {
    const item: OrderItemFormData = {
      productId: 'p1',
      productCode: 'P1',
      productName: 'Product 1',
      stock: [
        {
          warehouseId: 'wh1',
          warehouseCode: 'WH1',
          warehouseName: 'WH1',
          quantity: 10,
          reserved: 0,
          available: 10,
        },
      ],
      quantity: 15,
      unitPrice: 100,
      warehouseAllocations: [],
    };
    expect(component.isItemOverAllocated(item)).toBe(true);
  });

  it('should not detect over-allocated item when quantity is within available', () => {
    const item: OrderItemFormData = {
      productId: 'p1',
      productCode: 'P1',
      productName: 'Product 1',
      stock: [
        {
          warehouseId: 'wh1',
          warehouseCode: 'WH1',
          warehouseName: 'WH1',
          quantity: 10,
          reserved: 0,
          available: 10,
        },
      ],
      quantity: 5,
      unitPrice: 100,
      warehouseAllocations: [],
    };
    expect(component.isItemOverAllocated(item)).toBe(false);
  });

  it('should use the single warehouse when the item has no allocation', () => {
    recreateWithSingleWarehouse({ id: 'wh1', code: 'WH1', name: 'Warehouse 1' });

    expect(component.warehouseForItem(mockAllocationItem([]))).toEqual({
      id: 'wh1',
      code: 'WH1',
      name: 'Warehouse 1',
    });
  });

  it('should use the single warehouse when the item has a single allocation', () => {
    recreateWithSingleWarehouse({ id: 'wh1', code: 'WH1', name: 'Warehouse 1' });

    expect(component.warehouseForItem(mockAllocationItem([allocation('wh1')]))).not.toBeNull();
  });

  it('should fall back to the dialog when the item has several allocations', () => {
    recreateWithSingleWarehouse({ id: 'wh1', code: 'WH1', name: 'Warehouse 1' });

    expect(
      component.warehouseForItem(
        mockAllocationItem([allocation('wh1'), allocation('wh2')]),
      ),
    ).toBeNull();
  });

  it('should fall back to the dialog without a single warehouse', () => {
    expect(component.warehouseForItem(mockAllocationItem([]))).toBeNull();
  });
});

describe('OrderItemsTableComponent - with items', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let component: OrderItemsTableComponent;

  const mockItems: OrderItemFormData[] = [
    {
      productId: 'p1',
      productCode: 'P1',
      productName: 'Product One',
      stock: [],
      quantity: 2,
      unitPrice: 100,
      warehouseAllocations: [],
    },
    {
      productId: 'p2',
      productCode: 'P2',
      productName: 'Product Two',
      stock: [],
      quantity: 3,
      unitPrice: 50,
      warehouseAllocations: [],
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.items = mockItems;
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should calculate total from items', () => {
    expect(component.total()).toBe(350);
  });

  it('should compute excludedProductIds from items', () => {
    const excluded = component.excludedProductIds();
    expect(excluded.has('p1')).toBe(true);
    expect(excluded.has('p3')).toBe(false);
  });

  it('should resolve product name from item data', () => {
    expect(component.resolveProductName('p1')).toBe('P1 — Product One');
  });

  it('should remove item and emit updated items', () => {
    component.removeItem(0);
    expect(hostComponent.onItemsChange).toHaveBeenCalledWith([
      expect.objectContaining({ productId: 'p2' }),
    ]);
  });
});

describe('OrderItemsTableComponent - invoice context', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let component: OrderItemsTableComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.context = 'invoice';
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should have titleLabel for invoice context', () => {
    expect(component.titleLabel()).toBe('sales.orders.invoiceLines');
  });

  it('should have totalLabel for invoice context', () => {
    expect(component.totalLabel()).toBe('sales.orders.invoiceTotal');
  });
});

describe('OrderItemsTableComponent - with customerId', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let component: OrderItemsTableComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.customerId = 'c1';
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should open picker with customerId', () => {
    component.openPicker();
    expect(component.pickerVisible()).toBe(true);
  });
});

describe('OrderItemsTableComponent - with products', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let component: OrderItemsTableComponent;

  const mockItems: OrderItemFormData[] = [
    {
      productId: 'p1',
      productCode: '',
      productName: '',
      stock: undefined as any,
      quantity: 1,
      unitPrice: 100,
      warehouseAllocations: [],
    },
  ];

  const mockProducts: ProductList[] = [
    { id: 'p1', code: 'PC', name: 'Product From List', stockTotal: 15, active: true },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.items = mockItems;
    hostComponent.products = mockProducts;
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should resolve product name from products list when item lacks name', () => {
    expect(component.resolveProductName('p1')).toBe('PC — Product From List');
  });

  it('should resolve product stock from products list', () => {
    expect(component.resolveProductStock('p1')).toBe(15);
  });
});

describe('OrderItemsTableComponent - with stock items', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let component: OrderItemsTableComponent;

  const mockItems: OrderItemFormData[] = [
    {
      productId: 'p1',
      productCode: 'P1',
      productName: 'Product 1',
      stock: [
        {
          warehouseId: 'wh1',
          warehouseCode: 'WH1',
          warehouseName: 'WH1',
          quantity: 10,
          reserved: 0,
          available: 10,
        },
        {
          warehouseId: 'wh2',
          warehouseCode: 'WH2',
          warehouseName: 'WH2',
          quantity: 20,
          reserved: 0,
          available: 20,
        },
      ],
      quantity: 1,
      unitPrice: 100,
      warehouseAllocations: [],
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.items = mockItems;
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should resolve product stock from item stock', () => {
    expect(component.resolveProductStock('p1')).toBe(30);
  });
});

describe('OrderItemsTableComponent - allocation popover', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let component: OrderItemsTableComponent;

  const mockItem: OrderItemFormData = {
    productId: 'p1',
    productCode: 'P1',
    productName: 'Product 1',
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
    quantity: 10,
    unitPrice: 100,
    warehouseAllocations: [
      {
        warehouseId: 'wh1',
        warehouseCode: 'WH1',
        warehouseName: 'Warehouse 1',
        available: 25,
        allocated: 5,
      },
      {
        warehouseId: 'wh2',
        warehouseCode: 'WH2',
        warehouseName: 'Warehouse 2',
        available: 20,
        allocated: 5,
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.items = [mockItem];
    hostComponent.customerId = 'c1';
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should build the allocation entries for the item', () => {
    const entries = component.allocationEntriesFor(hostComponent.items[0])();

    expect(entries).toHaveLength(2);
    expect(entries[0].available).toBe(25);
  });

  it('should confirm allocations and emit itemsChange', () => {
    component.onAllocationSaved(0, [
      {
        warehouseId: 'wh1',
        warehouseCode: 'WH1',
        warehouseName: 'WH1',
        quantity: 30,
        reserved: 5,
        available: 25,
        allocated: 10,
      },
      {
        warehouseId: 'wh2',
        warehouseCode: 'WH2',
        warehouseName: 'WH2',
        quantity: 20,
        reserved: 0,
        available: 20,
        allocated: 5,
      },
    ]);
    expect(hostComponent.onItemsChange).toHaveBeenCalled();
    const emitted = hostComponent.onItemsChange.mock.calls[0][0];
    expect(emitted[0].quantity).toBe(15);
    expect(emitted[0].warehouseAllocations).toHaveLength(2);
  });

  it('should not confirm allocations for an unknown line', () => {
    component.onAllocationSaved(99, []);
    expect(hostComponent.onItemsChange).not.toHaveBeenCalled();
  });

  it('should merge existing items when products added', () => {
    const newItems: ProductPickerSelection[] = [
      {
        product: {
          id: 'p2',
          code: 'P2',
          name: 'Product 2',
          categoryName: 'Category',
          active: true,
          price: 50,
          totalStock: 0,
          stockItems: [],
        },
        quantity: 2,
        unitPrice: 50,
        allocations: [],
      },
    ];
    component.onProductsAdded(newItems);
    expect(hostComponent.onItemsChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ productId: 'p1' }),
        expect.objectContaining({ productId: 'p2' }),
      ]),
    );
  });
});

describe('OrderItemsTableComponent - quote context', () => {
  let hostComponent: HostComponent;
  let fixture: ComponentFixture<HostComponent>;
  let component: OrderItemsTableComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    hostComponent.context = 'quote';
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance;
  });

  it('should use the quote translations', () => {
    expect(component.titleLabel()).toBe('sales.quotes.quoteLines');
    expect(component.totalLabel()).toBe('sales.quotes.quoteTotal');
  });
});
