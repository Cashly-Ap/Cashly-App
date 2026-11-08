import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NavigationHistoryService } from '@core/navigation/navigation-history.service';
import { WarehouseMovementsPageComponent } from '@features/inventory/warehouses/pages/warehouse-movements-page/warehouse-movements-page.component';
import {
  MovementGroupBy,
  MovementOverviewApiService,
  MovementOverviewGroup,
  MovementOverviewItem,
  MovementOverviewResponse,
} from '@features/inventory/warehouses/services/api/movement-overview-api.service';

function movement(overrides: Partial<MovementOverviewItem> = {}): MovementOverviewItem {
  return {
    id: 'm1',
    warehouseId: 'wh-1',
    warehouseName: 'Central',
    productId: 'p1',
    productCode: 'M-01',
    productName: 'Motor 10HP',
    categoryName: 'Motores',
    movementType: 'ENTRY',
    quantity: 5,
    previousStock: 0,
    newStock: 5,
    referenceType: null,
    referenceId: null,
    referenceNumber: null,
    notes: null,
    createdAt: '2026-10-31T10:00:00Z',
    ...overrides,
  };
}

function groupFor(mode: Exclude<MovementGroupBy, 'NONE'>): MovementOverviewGroup {
  const base = {
    movementCount: 2,
    entryQuantity: 12,
    exitQuantity: 0,
    netQuantity: 12,
    productCode: null,
    categoryName: null,
    warehouseName: null,
    movementType: null,
  };
  if (mode === 'PRODUCT')
    return {
      ...base,
      id: 'p1',
      name: 'Motor 10HP',
      productCode: 'M-01',
      categoryName: 'Motores',
      items: [
        movement(),
        movement({
          id: 'm2',
          warehouseId: 'wh-2',
          warehouseName: 'Norte',
          quantity: 7,
          newStock: 7,
        }),
      ],
    };
  if (mode === 'WAREHOUSE')
    return {
      ...base,
      id: 'wh-1',
      name: 'Central',
      warehouseName: 'Central',
      items: [
        movement(),
        movement({
          id: 'm2',
          productId: 'p2',
          productCode: 'B-02',
          productName: 'Bomba',
          quantity: 7,
          newStock: 7,
        }),
      ],
    };
  return {
    ...base,
    id: 'ENTRY',
    name: 'ENTRY',
    movementType: 'ENTRY',
    items: [movement(), movement({ id: 'm2' })],
  };
}

function overview(mode: MovementGroupBy = 'PRODUCT'): MovementOverviewResponse {
  const common = {
    summary: {
      movementCount: 25,
      productCount: 12,
      warehouseCount: 3,
      entryQuantity: 800,
      exitQuantity: 300,
      netQuantity: 500,
    },
    warehouses: [
      { id: 'wh-1', name: 'Central' },
      { id: 'wh-2', name: 'Norte' },
    ],
    products: [{ id: 'p1', name: 'Motor 10HP', code: 'M-01' }],
  };
  const paging = {
    totalElements: 35,
    totalPages: 4,
    number: 0,
    size: 10,
    first: true,
    last: false,
    empty: false,
  };
  if (mode === 'NONE')
    return {
      ...common,
      groupBy: mode,
      groups: null,
      movements: { ...paging, content: [movement()] },
    };
  return {
    ...common,
    groupBy: mode,
    movements: null,
    groups: { ...paging, content: [groupFor(mode)] },
  };
}

function emptyOverview(mode: MovementGroupBy = 'PRODUCT'): MovementOverviewResponse {
  const common = {
    summary: {
      movementCount: 0,
      productCount: 0,
      warehouseCount: 0,
      entryQuantity: 0,
      exitQuantity: 0,
      netQuantity: 0,
    },
    warehouses: [],
    products: [],
  };
  const paging = {
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10,
    first: true,
    last: true,
    empty: true,
  };
  if (mode === 'NONE')
    return {
      ...common,
      groupBy: mode,
      groups: null,
      movements: { ...paging, content: [] },
    };
  return {
    ...common,
    groupBy: mode,
    movements: null,
    groups: { ...paging, content: [] },
  };
}

describe('WarehouseMovementsPageComponent', () => {
  let fixture: ComponentFixture<WarehouseMovementsPageComponent>;
  let component: WarehouseMovementsPageComponent;
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  const api = { getOverview: vi.fn() };
  const history = { back: vi.fn() };
  const router = { navigate: vi.fn().mockResolvedValue(true) };

  beforeEach(() => {
    vi.clearAllMocks();
    api.getOverview.mockReturnValue(of(overview()));
    params = new BehaviorSubject(convertToParamMap({}));
    TestBed.configureTestingModule({
      imports: [WarehouseMovementsPageComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParamMap: params } },
        { provide: MovementOverviewApiService, useValue: api },
        { provide: NavigationHistoryService, useValue: history },
        { provide: Router, useValue: router },
      ],
    });
    fixture = TestBed.createComponent(WarehouseMovementsPageComponent);
    component = fixture.componentInstance;
  });

  it('loads the global movements view by default with PRODUCT grouping', () => {
    fixture.detectChanges();

    expect(api.getOverview).toHaveBeenCalledTimes(1);
    expect(api.getOverview).toHaveBeenCalledWith({
      groupBy: 'PRODUCT',
      warehouseId: undefined,
      productId: undefined,
      movementType: undefined,
      search: undefined,
      page: 0,
      size: 10,
    });
    expect(component.warehouseId()).toBeNull();
    expect(component.warehouseName()).toBe('Todos los almacenes');
    expect(component.activeFilterCount()).toBe(0);
    expect(component.hasFilters()).toBe(false);
  });

  it('opens the consolidated movements view when the URL has no warehouseId', () => {
    params.next(convertToParamMap({}));
    fixture.detectChanges();

    expect(api.getOverview).toHaveBeenCalledTimes(1);
    expect(api.getOverview).toHaveBeenCalledWith(
      expect.objectContaining({ groupBy: 'PRODUCT', warehouseId: undefined, page: 0 }),
    );
    expect(component.warehouseId()).toBeNull();
    expect(component.warehouseName()).toBe('Todos los almacenes');
  });

  it('keeps the movement filters inside a popover, like the stock view', () => {
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector(
      '[data-testid="movement-filters-trigger"] button',
    );
    expect(trigger).not.toBeNull();

    trigger.click();
    fixture.detectChanges();

    const panel = document.querySelector('[data-testid="movement-filters-panel"]');
    expect(panel).not.toBeNull();
    expect(panel?.querySelector('#movement-product')).not.toBeNull();
    expect(panel?.querySelector('#movement-warehouse')).not.toBeNull();
    expect(panel?.querySelector('#movement-type')).not.toBeNull();
    expect(panel?.querySelector('#movement-group-by')).not.toBeNull();
    expect(panel?.querySelector('app-search-field')).toBeNull();
  });

  it('filters the global view by the warehouse supplied in the query string', () => {
    params.next(convertToParamMap({ warehouseId: 'wh-2' }));
    fixture.detectChanges();

    expect(api.getOverview).toHaveBeenCalledWith(
      expect.objectContaining({ warehouseId: 'wh-2', page: 0 }),
    );
    expect(component.warehouseName()).toBe('Norte');
  });

  it('renders product groups with totals and every warehouse comparison', () => {
    fixture.detectChanges();

    expect(component.groups()).toHaveLength(1);
    expect(component.groups()[0].items).toHaveLength(2);
    expect(component.summary()?.netQuantity).toBe(500);
    expect(component.totalElements()).toBe(35);
    expect(component.resultLabel()).toBe('35 productos');
    const group = fixture.nativeElement.querySelector('[data-testid="movement-group"]');
    expect(group.textContent).toContain('Motor 10HP');
    expect(group.textContent).toContain('M-01');
    expect(group.textContent).toContain('Central');
    expect(group.textContent).toContain('Norte');
  });

  it('renders warehouse groups with all their movements and products', () => {
    fixture.detectChanges();
    api.getOverview.mockReturnValue(of(overview('WAREHOUSE')));

    component.onGroupByChange('WAREHOUSE');
    fixture.detectChanges();

    expect(api.getOverview).toHaveBeenLastCalledWith(
      expect.objectContaining({ groupBy: 'WAREHOUSE', page: 0 }),
    );
    expect(component.resultLabel()).toBe('35 almacenes');
    const group = fixture.nativeElement.querySelector('[data-testid="movement-group"]');
    expect(group.textContent).toContain('Central');
    expect(group.textContent).toContain('Motor 10HP');
    expect(group.textContent).toContain('Bomba');
  });

  it('renders movement-type groups with localized type labels', () => {
    fixture.detectChanges();
    api.getOverview.mockReturnValue(of(overview('MOVEMENT_TYPE')));

    component.onGroupByChange('MOVEMENT_TYPE');
    fixture.detectChanges();

    expect(api.getOverview).toHaveBeenLastCalledWith(
      expect.objectContaining({ groupBy: 'MOVEMENT_TYPE' }),
    );
    expect(component.resultLabel()).toBe('35 tipos de movimiento');
    const group = fixture.nativeElement.querySelector('[data-testid="movement-group"]');
    expect(group.textContent).toContain('Entrada');
  });

  it('renders ungrouped movements as individual rows with server totals', () => {
    fixture.detectChanges();
    api.getOverview.mockReturnValue(of(overview('NONE')));

    component.onGroupByChange('NONE');
    fixture.detectChanges();

    expect(component.groups()).toEqual([]);
    expect(component.movements()).toHaveLength(1);
    expect(component.resultLabel()).toBe('35 movimientos');
    expect(fixture.nativeElement.querySelector('[data-testid="movement-group"]')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Motor 10HP');
    expect(fixture.nativeElement.textContent).toContain('Entrada');
  });

  it('combines search, product, warehouse, type and grouping in a single request', () => {
    fixture.detectChanges();

    component.onSearchChange(' M-01 ');
    component.onProductChange('p1');
    component.onWarehouseChange('wh-2');
    component.onMovementTypeChange('EXIT');
    component.onGroupByChange('NONE');

    expect(api.getOverview).toHaveBeenLastCalledWith({
      groupBy: 'NONE',
      warehouseId: 'wh-2',
      productId: 'p1',
      movementType: 'EXIT',
      search: 'M-01',
      page: 0,
      size: 10,
    });
    expect(component.activeFilterCount()).toBe(4);
    expect(component.hasFilters()).toBe(true);
  });

  it('removes the movement type filter when the selection is cleared', () => {
    fixture.detectChanges();

    component.onMovementTypeChange('EXIT');
    component.onMovementTypeChange(null);

    expect(component.movementType()).toBe('');
    expect(api.getOverview).toHaveBeenLastCalledWith(
      expect.objectContaining({ movementType: undefined }),
    );
  });

  it('clears every filter, restores PRODUCT grouping and removes the warehouse query', () => {
    fixture.detectChanges();
    component.onProductChange('p1');
    component.onWarehouseChange('wh-2');
    component.onMovementTypeChange('EXIT');
    component.onSearchChange('M-01');
    component.onGroupByChange('NONE');
    expect(component.hasFilters()).toBe(true);

    component.clearFilters();

    expect(api.getOverview).toHaveBeenLastCalledWith({
      groupBy: 'PRODUCT',
      warehouseId: undefined,
      productId: undefined,
      movementType: undefined,
      search: undefined,
      page: 0,
      size: 10,
    });
    expect(component.warehouseId()).toBeNull();
    expect(component.productId()).toBeNull();
    expect(component.movementType()).toBe('');
    expect(component.search()).toBe('');
    expect(component.groupBy()).toBe('PRODUCT');
    expect(component.activeFilterCount()).toBe(0);
    expect(component.hasFilters()).toBe(false);
    expect(router.navigate).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({
        queryParams: { warehouseId: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      }),
    );
  });

  it('drops the warehouse filter when the optional query parameter disappears', () => {
    params.next(convertToParamMap({ warehouseId: 'wh-2' }));
    fixture.detectChanges();
    expect(component.warehouseId()).toBe('wh-2');

    params.next(convertToParamMap({}));
    fixture.detectChanges();

    expect(component.warehouseId()).toBeNull();
    expect(api.getOverview).toHaveBeenLastCalledWith(
      expect.objectContaining({ warehouseId: undefined, page: 0 }),
    );
  });

  it('paginates server groups without slicing members or recalculating totals', () => {
    fixture.detectChanges();

    component.onPageChange({ first: 20, rows: 10 });

    expect(api.getOverview).toHaveBeenLastCalledWith(
      expect.objectContaining({ groupBy: 'PRODUCT', page: 2, size: 10 }),
    );
    expect(component.groups()[0].items).toHaveLength(2);
    expect(component.summary()?.netQuantity).toBe(500);
    expect(component.totalElements()).toBe(35);
  });

  it('renders the empty state without an error when filters match no movements', () => {
    api.getOverview.mockReturnValue(of(emptyOverview()));
    fixture.detectChanges();

    expect(component.failed()).toBe(false);
    expect(component.totalElements()).toBe(0);
    expect(component.groups()).toEqual([]);
    expect(component.movements()).toEqual([]);
    expect(component.summary()?.movementCount).toBe(0);
    expect(fixture.nativeElement.textContent).toContain(
      'No hay movimientos que coincidan con los filtros',
    );
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it('distinguishes failed requests from empty results and supports retry', () => {
    api.getOverview.mockReturnValue(throwError(() => new Error('Unavailable')));
    fixture.detectChanges();

    expect(component.failed()).toBe(true);
    expect(component.summary()).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain(
      'Error al cargar los movimientos del almacén.',
    );
    expect(fixture.nativeElement.textContent).not.toContain('No hay movimientos que coincidan');

    api.getOverview.mockReturnValue(of(overview()));
    component.load();
    fixture.detectChanges();

    expect(component.failed()).toBe(false);
    expect(component.groups()).toHaveLength(1);
  });

  it('reports a backend 400 rejection as a failed load instead of an empty result', () => {
    api.getOverview.mockReturnValue(throwError(() => ({ status: 400, statusText: 'Bad Request' })));
    fixture.detectChanges();

    expect(component.failed()).toBe(true);
    expect(component.totalElements()).toBe(0);
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain(
      'No hay movimientos que coincidan con los filtros',
    );
  });

  it('cancels stale responses when filters change', () => {
    const pending = new Subject<MovementOverviewResponse>();
    api.getOverview.mockReturnValueOnce(pending).mockReturnValue(of(overview()));
    fixture.detectChanges();

    component.onProductChange('p1');
    const stale = overview();
    stale.summary.netQuantity = 999;
    pending.next(stale);

    expect(component.summary()?.netQuantity).toBe(500);
    expect(component.loading()).toBe(false);
  });

  it('returns to the warehouse list when no warehouse is selected', () => {
    fixture.detectChanges();

    component.onBack();

    expect(history.back).toHaveBeenCalledWith(['/inventory/warehouses']);
  });

  it('returns to the selected warehouse details when filtered', () => {
    params.next(convertToParamMap({ warehouseId: 'wh-1' }));
    fixture.detectChanges();

    component.onBack();

    expect(history.back).toHaveBeenCalledWith(['/inventory/warehouses', 'wh-1']);
  });

  it('falls back to the raw values for unknown movement and reference types', () => {
    expect(component.getMovementTypeLabel('UNKNOWN')).toBe('UNKNOWN');
    expect(component.getMovementTypeLabel(null)).toBe('');
    expect(component.getReferenceTypeLabel('SALE')).toBe('SALE');
    expect(component.getReferenceTypeLabel(null)).toBe('');
    expect(component.getMovementTypeVariant('UNKNOWN')).toBe('secondary');
  });
});
