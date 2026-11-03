import { TranslationService } from '@core/i18n/translation.service';
import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { NavigationHistoryService } from '@core/navigation/navigation-history.service';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  EMPTY,
  Subject,
  catchError,
  distinctUntilChanged,
  finalize,
  map,
  switchMap,
  tap,
} from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import { ListFilterComponent, ListContainerComponent } from '@shared/components/list';
import { PaginatorModule } from 'primeng/paginator';

import { DetailsCardHeaderComponent } from '@shared/components/details/details-card-header/details-card-header.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';
import {
  StockOverviewApiService,
  StockGroupBy,
  StockOverviewGroup,
  StockOverviewFilters,
  StockOverviewItem,
  StockOverviewSummary,
} from '@features/inventory/warehouses/services/api/stock-overview-api.service';
import { WAREHOUSE_ERROR_MESSAGES } from '@features/inventory/warehouses/messages/error-messages';

const PAGE_SIZE = 10;

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { BackButtonComponent } from '@shared/components/ui/back-button/back-button.component';
import { StatCardComponent } from '@shared/components/ui/stat-card/stat-card.component';
@Component({
  selector: 'app-warehouse-stock-page',
  standalone: true,
  imports: [
    StatCardComponent,
    BackButtonComponent,
    PanelCardComponent,
    ListFilterComponent,
    TranslateOptionsPipe,
    TranslatePipe,
    LocalizedNumberPipe,
    FormsModule,
    ButtonModule,
    SelectModule,
    PaginatorModule,
    PopoverModule,
    TooltipModule,
    ListContainerComponent,
    DetailsCardHeaderComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    SearchFieldComponent,
  ],
  templateUrl: './warehouse-stock-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehouseStockPageComponent implements OnInit {
  private readonly translations = inject(TranslationService);
  private readonly navigationHistory = inject(NavigationHistoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(StockOverviewApiService);
  private readonly router = inject(Router);
  private routeInitialized = false;
  private readonly destroyRef = inject(DestroyRef);
  private readonly requests = new Subject<StockOverviewFilters>();

  readonly warehouseId = signal<string | null>(null);
  readonly categoryId = signal<string | null>(null);
  readonly warehouses = signal<{ id: string; name: string }[]>([]);
  readonly categories = signal<{ id: string; name: string }[]>([]);
  readonly stock = signal<StockOverviewItem[]>([]);
  readonly groups = signal<StockOverviewGroup[]>([]);
  readonly groupBy = signal<StockGroupBy>('PRODUCT');
  readonly displayedGroupBy = signal<StockGroupBy>('PRODUCT');
  readonly groupOptions = [
    { label: 'Producto', value: 'PRODUCT' },
    { label: 'Almacén', value: 'WAREHOUSE' },
    { label: 'Sin agrupar', value: 'NONE' },
  ];
  readonly summary = signal<StockOverviewSummary | null>(null);
  readonly loading = signal(false);
  readonly failed = signal(false);
  readonly search = signal('');
  readonly page = signal(0);
  readonly rows = signal(PAGE_SIZE);
  readonly totalElements = signal(0);
  readonly errorMessage = WAREHOUSE_ERROR_MESSAGES.loadStock;
  readonly warehouseName = computed(() => {
    const id = this.warehouseId();
    if (!id) return this.translations.t('inventory.warehouses.allWarehouses');
    return (
      this.warehouses().find((warehouse) => warehouse.id === id)?.name ??
      this.translations.t('inventory.warehouses.selectedWarehouse')
    );
  });
  readonly activeFilterCount = computed(
    () =>
      Number(!!this.warehouseId()) +
      Number(!!this.categoryId()) +
      Number(this.groupBy() !== 'PRODUCT'),
  );
  readonly hasFilters = computed(() => this.activeFilterCount() > 0 || !!this.search());
  readonly resultLabel = computed(() => {
    const count = this.totalElements();
    if (this.displayedGroupBy() === 'PRODUCT')
      return this.translations.t(
        count === 1 ? 'inventory.warehouses.countProduct' : 'inventory.warehouses.countProducts',
        { count },
      );
    if (this.displayedGroupBy() === 'WAREHOUSE')
      return this.translations.t(
        count === 1
          ? 'inventory.warehouses.countWarehouse'
          : 'inventory.warehouses.countWarehouses',
        { count },
      );
    return this.translations.t(
      count === 1 ? 'inventory.warehouses.countRecord' : 'inventory.warehouses.countRecords',
      { count },
    );
  });
  readonly paginationLabel = computed(() =>
    this.displayedGroupBy() === 'PRODUCT'
      ? this.translations.t('inventory.warehouses.paginationProducts')
      : this.displayedGroupBy() === 'WAREHOUSE'
        ? this.translations.t('inventory.warehouses.paginationWarehouses')
        : this.translations.t('inventory.warehouses.paginationRecords'),
  );

  constructor() {
    this.requests
      .pipe(
        switchMap((filters) => {
          this.loading.set(true);
          this.failed.set(false);
          this.stock.set([]);
          this.groups.set([]);
          this.summary.set(null);
          return this.api.getOverview(filters).pipe(
            tap((response) => {
              this.displayedGroupBy.set(response.groupBy);
              if (response.groupBy === 'NONE') {
                this.stock.set(response.stock.content);
                this.totalElements.set(response.stock.totalElements);
              } else {
                this.groups.set(response.groups.content);
                this.totalElements.set(response.groups.totalElements);
              }
              this.summary.set(response.summary);
              this.warehouses.set(response.warehouses);
              this.categories.set(response.categories);
            }),
            catchError(() => {
              this.failed.set(true);
              this.totalElements.set(0);
              return EMPTY;
            }),
            finalize(() => this.loading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        map((params) => params.get('warehouseId')),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((id) => {
        if (this.routeInitialized && this.warehouseId() === id) return;
        this.routeInitialized = true;
        this.warehouseId.set(id);
        this.page.set(0);
        this.load();
      });
  }

  onSearchChange(value: string): void {
    this.search.set(value.trim());
    this.page.set(0);
    this.load();
  }

  onWarehouseChange(id: string | null): void {
    this.warehouseId.set(id);
    this.page.set(0);
    this.load();
    this.syncWarehouseQuery();
  }

  onCategoryChange(id: string | null): void {
    this.categoryId.set(id);
    this.page.set(0);
    this.load();
  }

  onGroupByChange(value: StockGroupBy): void {
    this.groupBy.set(value);
    this.page.set(0);
    this.load();
  }

  onPageChange(event: { first: number; rows: number }): void {
    this.rows.set(event.rows);
    this.page.set(Math.floor(event.first / event.rows));
    this.load();
  }

  clearFilters(): void {
    this.warehouseId.set(null);
    this.categoryId.set(null);
    this.search.set('');
    this.groupBy.set('PRODUCT');
    this.page.set(0);
    this.load();
    this.syncWarehouseQuery();
  }

  onBack(): void {
    this.navigationHistory.back(['/inventory/warehouses']);
  }

  load(): void {
    this.requests.next({
      groupBy: this.groupBy(),
      warehouseId: this.warehouseId() ?? undefined,
      categoryId: this.categoryId() ?? undefined,
      search: this.search() || undefined,
      page: this.page(),
      size: this.rows(),
    });
  }

  private syncWarehouseQuery(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { warehouseId: this.warehouseId() },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
