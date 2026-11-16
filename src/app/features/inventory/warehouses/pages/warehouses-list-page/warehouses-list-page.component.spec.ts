import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, NavigationEnd, Router, convertToParamMap } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { signal } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WarehousesListPageComponent } from '@features/inventory/warehouses/pages/warehouses-list-page/warehouses-list-page.component';
import { WarehouseApplicationService } from '@features/inventory/warehouses/services/application/warehouse-application.service';
import { WarehouseList } from '@features/inventory/warehouses/models/interfaces/warehouse.interfaces';
import { ProductApplicationService } from '@features/catalog/products/services/application/product-application.service';
import { ListNavigationService } from '@shared/components/list/list-navigation.service';
import { DeleteDialogService } from '@shared/services/delete-dialog.service';

describe('WarehousesListPageComponent', () => {
  let fixture: ComponentFixture<WarehousesListPageComponent>;
  let component: WarehousesListPageComponent;
  let router: Router;
  let navigation: ListNavigationService;
  const navigate = vi.fn().mockResolvedValue(true);
  const queryParams = new BehaviorSubject(convertToParamMap({}));
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
    TestBed.resetTestingModule();
    vi.clearAllMocks();
    navigate.mockClear();
    queryParams.next(convertToParamMap({}));
    TestBed.configureTestingModule({
      imports: [WarehousesListPageComponent],
      providers: [
        {
          provide: Router,
          useValue: {
            url: '/inventory/warehouses',
            events: of(new NavigationEnd(1, '/inventory/warehouses', '/inventory/warehouses')),
            navigate,
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParams,
            snapshot: { paramMap: { get: () => null }, queryParamMap: { get: () => null } },
          },
        },
        { provide: AuthorizationService, useValue: { can: () => true } },
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
    navigation = TestBed.inject(ListNavigationService);
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
      'Historial',
    ]);
  });

  it('executes the registered delete action on the active warehouse list', () => {
    const deletion = TestBed.inject(DeleteDialogService);

    expect(navigation.executeRegistered('/inventory/warehouses', 'Eliminar', warehouse.id)).toBe(
      true,
    );
    expect(deletion.request()).toEqual({
      resource: 'warehouses',
      id: warehouse.id,
      label: warehouse.name,
    });
    expect(navigate).not.toHaveBeenCalled();
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

  it.each(['Registrar entrada', 'Registrar salida'])(
    'ignores the %s navbar action delivered as a query parameter',
    async (label) => {
      queryParams.next(convertToParamMap({ navAction: label }));
      await Promise.resolve();

      expect(navigation.session()).toBeNull();
    },
  );

  it('ignores the movements history navbar action delivered as a query parameter', async () => {
    queryParams.next(convertToParamMap({ navAction: 'Historial de movimientos' }));
    await Promise.resolve();

    expect(navigation.session()).toBeNull();
  });

  it('navigates to stock, movements, details, and edit pages', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.onViewStock(warehouse);
    component.onViewMovements(warehouse);
    component.onView(warehouse);
    component.onEdit(warehouse);

    expect(navigateSpy).toHaveBeenNthCalledWith(1, ['/inventory/warehouses/stock'], {
      queryParams: { warehouseId: 'wh-1' },
    });
    expect(navigateSpy).toHaveBeenNthCalledWith(2, ['/inventory/warehouses/movements'], {
      queryParams: { warehouseId: 'wh-1' },
    });
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
