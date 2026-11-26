import { provideRouter } from '@angular/router';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WarehouseStockOperationDialogComponent } from '@features/inventory/warehouses/components/warehouse-stock-operation-dialog/warehouse-stock-operation-dialog.component';
import { ProductApplicationService } from '@features/catalog/products/services/application/product-application.service';
import { ProductApiService } from '@features/catalog/products/services/api/product-api.service';
import { WarehouseApplicationService } from '@features/inventory/warehouses/services/application/warehouse-application.service';
import { StockOverviewApiService } from '@features/inventory/warehouses/services/api/stock-overview-api.service';
import { ProductPickerSelection } from '@shared/components/product-picker-dialog/product-picker.models';

describe('WarehouseStockOperationDialogComponent', () => {
  let fixture: ComponentFixture<WarehouseStockOperationDialogComponent>;
  let component: WarehouseStockOperationDialogComponent;
  const warehouseService = {
    getStock: vi
      .fn()
      .mockReturnValue(
        of([{ productId: 'p1', productName: 'Motor', composite: false, quantity: 10 }]),
      ),
    addEntry: vi.fn().mockReturnValue(of(undefined)),
    addExit: vi.fn().mockReturnValue(of(undefined)),
  };
  const productService = {
    simpleProducts: signal([
      { id: 'p1', name: 'Motor', composite: false },
      { id: 'p2', name: 'Kit eléctrico', composite: true },
    ]),
    loadSimpleProducts: vi.fn().mockReturnValue(of([])),
    getById: vi.fn().mockReturnValue(
      of({
        id: 'p2',
        name: 'Kit eléctrico',
        composite: true,
        components: [
          {
            id: 'pc1',
            componentProductId: 'p1',
            componentProductCode: 'MOT-1',
            componentProductName: 'Motor',
            quantity: 2,
          },
        ],
      }),
    ),
  };
  const productApi = {
    getAll: vi
      .fn()
      .mockReturnValue(of({ content: [], totalElements: 0, totalPages: 0, number: 0 })),
  };
  const stockOverviewApi = {
    getOverview: vi.fn().mockReturnValue(
      of({
        groupBy: 'NONE',
        stock: { content: [], totalElements: 0, totalPages: 0, number: 0 },
        groups: null,
      }),
    ),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WarehouseStockOperationDialogComponent],
      providers: [
        provideRouter([]),
        { provide: AuthorizationService, useValue: { can: () => true } },
        { provide: WarehouseApplicationService, useValue: warehouseService },
        { provide: ProductApplicationService, useValue: productService },
        { provide: ProductApiService, useValue: productApi },
        { provide: StockOverviewApiService, useValue: stockOverviewApi },
        MessageService,
      ],
    });
    fixture = TestBed.createComponent(WarehouseStockOperationDialogComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('warehouseId', 'wh-1');
  });

  it('loads stock when opened', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    expect(warehouseService.getStock).toHaveBeenCalledWith('wh-1');
    expect(component.stock()).toHaveLength(1);
  });

  it('submits an entry through the warehouse service', () => {
    fixture.componentRef.setInput('operation', 'entry');
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    component.lines.at(0).patchValue({ productId: 'p1', quantity: 2 });

    component.submit();

    expect(warehouseService.addEntry).toHaveBeenCalledWith('wh-1', {
      items: [{ productId: 'p1', quantity: 2 }],
    });
  });

  it('submits an exit through the warehouse service', () => {
    fixture.componentRef.setInput('operation', 'exit');
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    component.lines.at(0).patchValue({ productId: 'p1', quantity: 2 });

    component.submit();

    expect(warehouseService.addExit).toHaveBeenCalledWith('wh-1', {
      items: [{ productId: 'p1', quantity: 2 }],
    });
  });

  it('shows the components consumed by a composite entry', () => {
    fixture.componentRef.setInput('operation', 'entry');
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    component.lines.at(0).patchValue({ productId: 'p2', quantity: 3 });

    component.onProductSelected('p2');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Producto compuesto');
    expect(fixture.nativeElement.textContent).toContain('6 × Motor');
  });

  it('adds several selected products to separate lines', () => {
    const selections = ['p1', 'p2'].map(
      (id) =>
        ({
          product: {
            id,
            code: id,
            name: id,
            categoryName: '',
            active: true,
            price: 10,
            totalStock: 20,
            stockItems: [],
          },
          quantity: 1,
          unitPrice: 10,
          allocations: [],
        }) as ProductPickerSelection,
    );

    component.onProductsPicked(selections);

    expect(component.lines.length).toBe(2);
    expect(component.lines.at(0).get('productId')?.value).toBe('p1');
    expect(component.lines.at(1).get('productId')?.value).toBe('p2');
  });

  it('excludes products already used by other lines', () => {
    component.lines.at(0).patchValue({ productId: 'p1' });
    component.addLine().patchValue({ productId: 'p2' });

    component.openProductPicker(1);

    expect(component.excludedProductIds().has('p1')).toBe(true);
    expect(component.excludedProductIds().has('p2')).toBe(false);
  });
});
