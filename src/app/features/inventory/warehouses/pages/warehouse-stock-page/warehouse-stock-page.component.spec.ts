import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { NavigationHistoryService } from '@core/navigation/navigation-history.service';
import { WarehouseStockPageComponent } from './warehouse-stock-page.component';
import {
  StockGroupBy,
  StockOverviewApiService,
  StockOverviewItem,
  StockOverviewResponse,
} from '../../services/api/stock-overview-api.service';

const stockItem: StockOverviewItem = {
  id: 's1',
  warehouseId: 'wh-1',
  warehouseName: 'Central',
  productId: 'p1',
  productCode: 'M-01',
  productName: 'Motor 10HP',
  categoryId: 'cat-1',
  categoryName: 'Motores',
  composite: true,
  quantity: 5,
  reserved: 2,
  available: 3,
};

function overview(mode: StockGroupBy = 'PRODUCT'): StockOverviewResponse {
  const common = {
    summary: {
      productCount: 25,
      warehouseCount: 3,
      totalQuantity: 800,
      reservedQuantity: 120,
      availableQuantity: 680,
    },
    warehouses: [
      { id: 'wh-1', name: 'Central' },
      { id: 'wh-2', name: 'Norte' },
    ],
    categories: [{ id: 'cat-1', name: 'Motores' }],
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
      stock: { ...paging, content: [{ ...stockItem }] },
    };
  return {
    ...common,
    groupBy: mode,
    stock: null,
    groups: {
      ...paging,
      content: [
        {
          id: mode === 'PRODUCT' ? 'p1' : 'wh-1',
          name: mode === 'PRODUCT' ? 'Motor 10HP' : 'Central',
          productCode: mode === 'PRODUCT' ? 'M-01' : null,
          categoryName: mode === 'PRODUCT' ? 'Motores' : null,
          quantity: 12,
          reserved: 3,
          available: 9,
          productCount: mode === 'PRODUCT' ? 1 : 2,
          warehouseCount: mode === 'PRODUCT' ? 2 : 1,
          items: [
            { ...stockItem },
            mode === 'PRODUCT'
              ? {
                  ...stockItem,
                  id: 's2',
                  warehouseId: 'wh-2',
                  warehouseName: 'Norte',
                  quantity: 7,
                  reserved: 1,
                  available: 6,
                }
              : {
                  ...stockItem,
                  id: 's2',
                  productId: 'p2',
                  productCode: 'B-02',
                  productName: 'Bomba',
                  quantity: 7,
                  reserved: 1,
                  available: 6,
                },
          ],
        },
      ],
    },
  };
}

describe('WarehouseStockPageComponent', () => {
  let fixture: ComponentFixture<WarehouseStockPageComponent>;
  let component: WarehouseStockPageComponent;
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  const api = { getOverview: vi.fn() };
  const history = { back: vi.fn() };
  const router = { navigate: vi.fn().mockResolvedValue(true) };

  beforeEach(() => {
    vi.clearAllMocks();
    api.getOverview.mockReturnValue(of(overview()));
    params = new BehaviorSubject(convertToParamMap({ warehouseId: 'wh-1' }));
    TestBed.configureTestingModule({
      imports: [WarehouseStockPageComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParamMap: params } },
        { provide: StockOverviewApiService, useValue: api },
        { provide: NavigationHistoryService, useValue: history },
        { provide: Router, useValue: router },
      ],
    });
    fixture = TestBed.createComponent(WarehouseStockPageComponent);
    component = fixture.componentInstance;
  });

  it('loads PRODUCT grouping by default and renders complete warehouse comparisons', () => {
    fixture.detectChanges();
    expect(api.getOverview).toHaveBeenCalledWith({
      groupBy: 'PRODUCT',
      warehouseId: 'wh-1',
      categoryId: undefined,
      search: undefined,
      page: 0,
      size: 10,
    });
    expect(component.groups()).toHaveLength(1);
    expect(component.groups()[0].items).toHaveLength(2);
    expect(component.summary()?.totalQuantity).toBe(800);
    expect(component.totalElements()).toBe(35);
    expect(component.resultLabel()).toBe('35 productos');
    expect(component.warehouseName()).toBe('Central');
    const group = fixture.nativeElement.querySelector('[data-testid="stock-group"]');
    expect(group.textContent).toContain('Motor 10HP');
    expect(group.textContent).toContain('M-01');
    expect(group.textContent).toContain('Central');
    expect(group.textContent).toContain('Norte');
    expect(fixture.nativeElement.textContent).toContain('Ver stock');
  });

  it('sends filters to the server, resets pagination and synchronizes warehouse query once', () => {
    fixture.detectChanges();
    component.onPageChange({ first: 20, rows: 10 });
    component.onCategoryChange('cat-1');
    component.onWarehouseChange('wh-2');
    const callsBeforeQuery = api.getOverview.mock.calls.length;
    params.next(convertToParamMap({ warehouseId: 'wh-2' }));
    expect(api.getOverview).toHaveBeenCalledTimes(callsBeforeQuery);
    expect(router.navigate).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({
        queryParams: { warehouseId: 'wh-2' },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      }),
    );
    component.onSearchChange(' M-01 ');
    expect(api.getOverview).toHaveBeenLastCalledWith({
      groupBy: 'PRODUCT',
      warehouseId: 'wh-2',
      categoryId: 'cat-1',
      search: 'M-01',
      page: 0,
      size: 10,
    });
    component.onGroupByChange('WAREHOUSE');
    expect(component.activeFilterCount()).toBe(3);
    component.clearFilters();
    expect(api.getOverview).toHaveBeenLastCalledWith({
      groupBy: 'PRODUCT',
      warehouseId: undefined,
      categoryId: undefined,
      search: undefined,
      page: 0,
      size: 10,
    });
    expect(router.navigate).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({ queryParams: { warehouseId: null }, replaceUrl: true }),
    );
  });

  it('paginates server groups without slicing group members or calculating page totals', () => {
    fixture.detectChanges();
    component.onPageChange({ first: 1, rows: 1 });
    expect(api.getOverview).toHaveBeenLastCalledWith(
      expect.objectContaining({ groupBy: 'PRODUCT', page: 1, size: 1 }),
    );
    expect(component.groups()[0].items).toHaveLength(2);
    expect(component.summary()?.totalQuantity).toBe(800);
    expect(component.totalElements()).toBe(35);
  });

  it('renders WAREHOUSE panels with all products and categories supplied by the server', () => {
    fixture.detectChanges();
    api.getOverview.mockReturnValue(of(overview('WAREHOUSE')));
    component.onGroupByChange('WAREHOUSE');
    fixture.detectChanges();
    expect(api.getOverview).toHaveBeenLastCalledWith(
      expect.objectContaining({ groupBy: 'WAREHOUSE', page: 0 }),
    );
    expect(component.resultLabel()).toBe('35 almacenes');
    const group = fixture.nativeElement.querySelector('[data-testid="stock-group"]');
    expect(group.textContent).toContain('Central');
    expect(group.textContent).toContain('Motor 10HP');
    expect(group.textContent).toContain('Bomba');
    expect(group.textContent).toContain('Motores');
  });

  it('renders NONE as individual rows and paginates row totals from the server', () => {
    fixture.detectChanges();
    api.getOverview.mockReturnValue(of(overview('NONE')));
    component.onGroupByChange('NONE');
    fixture.detectChanges();
    expect(component.groups()).toEqual([]);
    expect(component.stock()).toHaveLength(1);
    expect(component.resultLabel()).toBe('35 registros de producto y almacén');
    expect(fixture.nativeElement.querySelector('[data-testid="stock-group"]')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('M-01');
    expect(fixture.nativeElement.textContent).toContain('Compuesto');
  });

  it('reacts to warehouse query changes and cancels previous responses', () => {
    const pending = new Subject<StockOverviewResponse>();
    api.getOverview.mockReturnValueOnce(pending).mockReturnValue(of(overview()));
    fixture.detectChanges();
    params.next(convertToParamMap({ warehouseId: 'wh-2' }));
    expect(api.getOverview).toHaveBeenLastCalledWith(
      expect.objectContaining({ warehouseId: 'wh-2', page: 0 }),
    );
    const staleResponse = overview();
    staleResponse.summary.totalQuantity = 999;
    pending.next(staleResponse);
    expect(component.summary()?.totalQuantity).toBe(800);
    expect(component.loading()).toBe(false);
    params.next(convertToParamMap({}));
    expect(api.getOverview).toHaveBeenLastCalledWith(
      expect.objectContaining({ warehouseId: undefined }),
    );
  });

  it('distinguishes failed requests from empty filtered results and supports retry', () => {
    params.next(convertToParamMap({}));
    api.getOverview.mockReturnValue(throwError(() => new Error('Unavailable')));
    fixture.detectChanges();
    expect(component.failed()).toBe(true);
    expect(component.summary()).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('No hay existencias');
    api.getOverview.mockReturnValue(of(overview()));
    component.load();
    fixture.detectChanges();
    expect(component.failed()).toBe(false);
    expect(component.groups()).toHaveLength(1);
  });

  it('returns through navigation history', () => {
    fixture.detectChanges();
    component.onBack();
    expect(history.back).toHaveBeenCalledWith(['/inventory/warehouses']);
  });
});
