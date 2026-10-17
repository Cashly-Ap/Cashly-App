import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WarehousesListPageComponent } from '@features/inventory/warehouses/pages/warehouses-list-page/warehouses-list-page.component';
import { WarehouseApplicationService } from '@features/inventory/warehouses/services/application/warehouse-application.service';
import { WarehouseList } from '@features/inventory/warehouses/models/interfaces/warehouse.interfaces';
import { ProductApplicationService } from '@features/catalog/products/services/application/product-application.service';

describe('WarehousesListPageComponent', () => {
  let fixture: ComponentFixture<WarehousesListPageComponent>;
  let component: WarehousesListPageComponent;
  let router: Router;
  const warehouse: WarehouseList = {
    id: 'wh-1',
    name: 'Central',
    state: 'Distrito Capital',
    municipality: 'Libertador',
    active: true,
    deletable: true,
  };
  const service = {
    warehouses: signal([warehouse]),
    loading: signal(false),
    totalElements: signal(1),
    loadAll: vi.fn().mockReturnValue(of({ content: [warehouse], totalElements: 1 })),
    toggleActive: vi.fn().mockReturnValue(of({})),
    delete: vi.fn().mockReturnValue(of(undefined)),
    getStock: vi.fn().mockReturnValue(of([])),
    addEntry: vi.fn().mockReturnValue(of(undefined)),
    addExit: vi.fn().mockReturnValue(of(undefined)),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [WarehousesListPageComponent],
      providers: [
        { provide: WarehouseApplicationService, useValue: service },
        {
          provide: ProductApplicationService,
          useValue: {
            simpleProducts: signal([]),
            loadSimpleProducts: vi.fn().mockReturnValue(of([])),
          },
        },
        ConfirmationService,
        MessageService,
      ],
    });
    fixture = TestBed.createComponent(WarehousesListPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('loads warehouses on init', () => {
    fixture.detectChanges();

    expect(service.loadAll).toHaveBeenCalled();
  });

  it('exposes every warehouse row action', () => {
    const labels = component.actionsFor(warehouse).map((action) => action.label);

    expect(labels).toEqual([
      'Registrar entrada',
      'Registrar salida',
      'Ver stock',
      'Historial de movimientos',
      'Ver detalle',
      'Editar',
      'Eliminar',
    ]);
  });

  it('opens the shared stock operation dialog for entries and exits', () => {
    component.onOpenEntry(warehouse);
    expect(component.selectedOperation()).toBe('entry');
    expect(component.operationDialogVisible()).toBe(true);

    component.operationDialogVisible.set(false);
    component.onOpenExit(warehouse);
    expect(component.selectedOperation()).toBe('exit');
    expect(component.operationDialogVisible()).toBe(true);
    expect(component.selectedWarehouse()).toEqual(warehouse);
  });

  it('navigates to stock, movements, details, and edit pages', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.onViewStock(warehouse);
    component.onViewMovements(warehouse);
    component.onView(warehouse);
    component.onEdit(warehouse);

    expect(navigateSpy).toHaveBeenNthCalledWith(1, ['/inventory/warehouses', 'wh-1', 'stock']);
    expect(navigateSpy).toHaveBeenNthCalledWith(2, ['/inventory/warehouses', 'wh-1', 'movements']);
    expect(navigateSpy).toHaveBeenNthCalledWith(3, ['/inventory/warehouses', 'wh-1']);
    expect(navigateSpy).toHaveBeenNthCalledWith(4, ['/inventory/warehouses', 'wh-1', 'edit']);
  });

  it('reloads with search, pagination, and active filters', () => {
    fixture.detectChanges();

    component.onSearch('central');
    component.onPageChange({ first: 10, rows: 10 });
    component.onActiveFilterChange('false');

    expect(component.searchTerm()).toBe('central');
    expect(component.first()).toBe(0);
    expect(component.filterActive()).toBe('false');
    expect(service.loadAll).toHaveBeenCalledTimes(4);
  });
});
