import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WarehouseStockOperationDialogComponent } from '@features/warehouses/components/warehouse-stock-operation-dialog/warehouse-stock-operation-dialog.component';
import { ProductApplicationService } from '@features/catalog/products/services/application/product-application.service';
import { WarehouseApplicationService } from '@features/warehouses/services/application/warehouse-application.service';

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WarehouseStockOperationDialogComponent],
      providers: [
        { provide: WarehouseApplicationService, useValue: warehouseService },
        { provide: ProductApplicationService, useValue: productService },
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
});
