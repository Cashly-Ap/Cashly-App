import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ProductApplicationService } from '@features/catalog/products/services/application/product-application.service';
import { WarehouseApplicationService } from '@features/inventory/warehouses/services/application/warehouse-application.service';
import { WarehouseStockOperationDialogComponent } from '@features/inventory/warehouses/components/warehouse-stock-operation-dialog/warehouse-stock-operation-dialog.component';
import { WarehouseActionDialogService } from '@core/layouts/services/warehouse-action-dialog.service';
import { WarehouseActionDialogHostComponent } from '@features/inventory/warehouses/components/warehouse-action-dialog-host/warehouse-action-dialog-host.component';

describe('WarehouseActionDialogHostComponent', () => {
  let fixture: ComponentFixture<WarehouseActionDialogHostComponent>;
  let component: WarehouseActionDialogHostComponent;
  let actions: WarehouseActionDialogService;

  beforeEach(async () => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [WarehouseActionDialogHostComponent],
      providers: [
        { provide: MessageService, useValue: { add: vi.fn() } },
        {
          provide: WarehouseApplicationService,
          useValue: {
            getStock: vi.fn(() => of([])),
            addEntry: vi.fn(() => of(undefined)),
            addExit: vi.fn(() => of(undefined)),
          },
        },
        {
          provide: ProductApplicationService,
          useValue: {
            simpleProducts: signal([]),
            loadSimpleProducts: vi.fn(() => of([])),
          },
        },
      ],
    })
      .overrideComponent(WarehouseStockOperationDialogComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(WarehouseActionDialogHostComponent);
    component = fixture.componentInstance;
    actions = TestBed.inject(WarehouseActionDialogService);
    fixture.detectChanges();
  });

  it('starts without a rendered dialog', () => {
    expect(component.visible()).toBe(false);
    expect(component.warehouseId()).toBe('');
    expect(component.warehouseName()).toBe('');
    expect(component.operation()).toBe('entry');
    expect(
      fixture.debugElement.query(By.directive(WarehouseStockOperationDialogComponent)),
    ).toBeNull();
  });

  it('renders the stock operation dialog for the requested warehouse', () => {
    actions.open({ warehouseId: 'warehouse-1', warehouseName: 'Central', operation: 'entry' });
    fixture.detectChanges();

    expect(component.warehouseId()).toBe('warehouse-1');
    expect(component.warehouseName()).toBe('Central');
    expect(component.operation()).toBe('entry');
    expect(component.visible()).toBe(true);

    const dialog = fixture.debugElement.query(By.directive(WarehouseStockOperationDialogComponent));
    expect(dialog).not.toBeNull();
    expect(dialog.componentInstance.warehouseId()).toBe('warehouse-1');
    expect(dialog.componentInstance.warehouseName()).toBe('Central');
    expect(dialog.componentInstance.operation()).toBe('entry');
    expect(dialog.componentInstance.visible()).toBe(true);
  });

  it('keeps the requested exit operation', () => {
    actions.open({ warehouseId: 'warehouse-2', warehouseName: 'Norte', operation: 'exit' });
    fixture.detectChanges();

    expect(component.operation()).toBe('exit');
    expect(component.warehouseName()).toBe('Norte');
  });

  it('resets every signal and closes the request when the dialog hides', () => {
    actions.open({ warehouseId: 'warehouse-1', warehouseName: 'Central', operation: 'exit' });
    fixture.detectChanges();

    component.onVisibleChange(false);
    fixture.detectChanges();

    expect(component.visible()).toBe(false);
    expect(component.warehouseId()).toBe('');
    expect(component.warehouseName()).toBe('');
    expect(component.operation()).toBe('entry');
    expect(actions.request()).toBeNull();
    expect(
      fixture.debugElement.query(By.directive(WarehouseStockOperationDialogComponent)),
    ).toBeNull();
  });
});
