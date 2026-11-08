import { TranslationService } from '@core/i18n/translation.service';
import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { LocalizedDatePipe, LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
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
import { PaginatorModule } from 'primeng/paginator';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ListFilterComponent, ListContainerComponent } from '@shared/components/list';

import { DetailsCardHeaderComponent } from '@shared/components/details/details-card-header/details-card-header.component';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '@shared/components/ui/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';
import {
  TextBadgeComponent,
  TextBadgeVariant,
} from '@shared/components/ui/text-badge/text-badge.component';
import { MovementType } from '@features/inventory/warehouses/models/enums/movement-type.enum';
import {
  ReferenceType,
  REFERENCE_TYPE_LABELS,
} from '@features/inventory/warehouses/models/enums/reference-type.enum';
import {
  MovementGroupBy,
  MovementOption,
  MovementOverviewApiService,
  MovementOverviewFilters,
  MovementOverviewGroup,
  MovementOverviewItem,
  MovementOverviewResponse,
  MovementOverviewSummary,
  MovementProductOption,
} from '@features/inventory/warehouses/services/api/movement-overview-api.service';
import { WAREHOUSE_ERROR_MESSAGES } from '@features/inventory/warehouses/messages/error-messages';

const PAGE_SIZE = 10;

const MOVEMENT_TYPE_KEYS: Record<MovementType, string> = {
  ENTRY: 'inventory.warehouses.entry',
  EXIT: 'inventory.warehouses.exit',
  ADJUSTMENT: 'inventory.warehouses.adjustment',
  COMPONENT_EXIT: 'inventory.warehouses.componentExit',
  TRANSFER_IN: 'inventory.warehouses.transferIn',
  TRANSFER_OUT: 'inventory.warehouses.transferOut',
  RETURN_ENTRY: 'inventory.warehouses.returnEntry',
  CANCEL_ENTRY: 'inventory.warehouses.cancellationEntry',
  SALE_EXIT: 'inventory.warehouses.salesExit',
};

const MOVEMENT_TYPE_VARIANTS: Record<MovementType, TextBadgeVariant> = {
  ENTRY: 'success',
  EXIT: 'danger',
  ADJUSTMENT: 'warning',
  COMPONENT_EXIT: 'danger',
  TRANSFER_IN: 'info',
  TRANSFER_OUT: 'info',
  RETURN_ENTRY: 'success',
  CANCEL_ENTRY: 'success',
  SALE_EXIT: 'danger',
};

import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { BackButtonComponent } from '@shared/components/ui/back-button/back-button.component';
import { StatCardComponent } from '@shared/components/ui/stat-card/stat-card.component';
import { PaginatorComponent } from '@shared/components/ui/paginator/paginator.component';
import { DataTableComponent } from '@shared/components/ui/data-table/data-table.component';

@Component({
  selector: 'app-warehouse-movements-page',
  standalone: true,
  imports: [
    DataTableComponent,
    PaginatorComponent,
    StatCardComponent,
    BackButtonComponent,
    PanelCardComponent,
    ListFilterComponent,
    TranslateOptionsPipe,
    TranslatePipe,
    LocalizedDatePipe,
    LocalizedNumberPipe,
    FormsModule,
    ButtonModule,
    PaginatorModule,
    PopoverModule,
    SelectModule,
    TooltipModule,
    ListContainerComponent,
    DetailsCardHeaderComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
    SearchFieldComponent,
    TextBadgeComponent,
  ],
  templateUrl: './warehouse-movements-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehouseMovementsPageComponent implements OnInit {
  private readonly translations = inject(TranslationService);
  private readonly navigationHistory = inject(NavigationHistoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(MovementOverviewApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly requests = new Subject<MovementOverviewFilters>();
  private routeInitialized = false;

  readonly warehouseId = signal<string | null>(null);
  readonly productId = signal<string | null>(null);
  readonly movementType = signal<MovementType | ''>('');
  readonly search = signal('');
  readonly warehouses = signal<MovementOption[]>([]);
  readonly products = signal<MovementProductOption[]>([]);
  readonly movements = signal<MovementOverviewItem[]>([]);
  readonly groups = signal<MovementOverviewGroup[]>([]);
  readonly groupBy = signal<MovementGroupBy>('PRODUCT');
  readonly displayedGroupBy = signal<MovementGroupBy>('PRODUCT');
  readonly summary = signal<MovementOverviewSummary | null>(null);
  readonly loading = signal(false);
  readonly failed = signal(false);
  readonly page = signal(0);
  readonly rows = signal(PAGE_SIZE);
  readonly totalElements = signal(0);
  readonly errorMessage = WAREHOUSE_ERROR_MESSAGES.loadMovements;

  readonly groupOptions: { label: string; value: MovementGroupBy }[] = [
    { label: 'inventory.warehouses.groupByProduct', value: 'PRODUCT' },
    { label: 'inventory.warehouses.groupByWarehouse', value: 'WAREHOUSE' },
    { label: 'inventory.warehouses.groupByMovementType', value: 'MOVEMENT_TYPE' },
    { label: 'inventory.warehouses.ungrouped', value: 'NONE' },
  ];

  readonly movementTypeOptions: { label: string; value: MovementType | '' }[] = [
    { label: 'inventory.warehouses.allMovementTypes', value: '' },
    { label: 'inventory.warehouses.entry', value: 'ENTRY' },
    { label: 'inventory.warehouses.exit', value: 'EXIT' },
    { label: 'inventory.warehouses.adjustment', value: 'ADJUSTMENT' },
    { label: 'inventory.warehouses.componentExit', value: 'COMPONENT_EXIT' },
    { label: 'inventory.warehouses.transferIn', value: 'TRANSFER_IN' },
    { label: 'inventory.warehouses.transferOut', value: 'TRANSFER_OUT' },
    { label: 'inventory.warehouses.returnEntry', value: 'RETURN_ENTRY' },
    { label: 'inventory.warehouses.cancellationEntry', value: 'CANCEL_ENTRY' },
    { label: 'inventory.warehouses.salesExit', value: 'SALE_EXIT' },
  ];

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
      Number(!!this.productId()) +
      Number(!!this.movementType()) +
      Number(this.groupBy() !== 'PRODUCT'),
  );

  readonly hasFilters = computed(() => this.activeFilterCount() > 0 || !!this.search());

  readonly resultLabel = computed(() => {
    const count = this.totalElements();
    const groupBy = this.displayedGroupBy();
    if (groupBy === 'PRODUCT')
      return this.translations.t(
        count === 1 ? 'inventory.warehouses.countProduct' : 'inventory.warehouses.countProducts',
        { count },
      );
    if (groupBy === 'WAREHOUSE')
      return this.translations.t(
        count === 1
          ? 'inventory.warehouses.countWarehouse'
          : 'inventory.warehouses.countWarehouses',
        { count },
      );
    if (groupBy === 'MOVEMENT_TYPE')
      return this.translations.t(
        count === 1
          ? 'inventory.warehouses.countMovementType'
          : 'inventory.warehouses.countMovementTypes',
        { count },
      );
    return this.translations.t(
      count === 1 ? 'inventory.warehouses.countMovement' : 'inventory.warehouses.countMovements',
      { count },
    );
  });

  readonly paginationLabel = computed(() => {
    const groupBy = this.displayedGroupBy();
    if (groupBy === 'PRODUCT')
      return this.translations.t('inventory.warehouses.paginationProducts');
    if (groupBy === 'WAREHOUSE')
      return this.translations.t('inventory.warehouses.paginationWarehouses');
    if (groupBy === 'MOVEMENT_TYPE')
      return this.translations.t('inventory.warehouses.paginationMovementTypes');
    return this.translations.t('inventory.warehouses.paginationMovements');
  });

  constructor() {
    this.requests
      .pipe(
        switchMap((filters) => {
          this.loading.set(true);
          this.failed.set(false);
          this.movements.set([]);
          this.groups.set([]);
          this.summary.set(null);
          return this.api.getOverview(filters).pipe(
            tap((response) => this.applyResponse(response)),
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

  onProductChange(id: string | null): void {
    this.productId.set(id);
    this.page.set(0);
    this.load();
  }

  onWarehouseChange(id: string | null): void {
    this.warehouseId.set(id);
    this.page.set(0);
    this.load();
    this.syncWarehouseQuery();
  }

  onMovementTypeChange(value: MovementType | '' | null): void {
    this.movementType.set(value ?? '');
    this.page.set(0);
    this.load();
  }

  onGroupByChange(value: MovementGroupBy): void {
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
    this.productId.set(null);
    this.movementType.set('');
    this.search.set('');
    this.groupBy.set('PRODUCT');
    this.page.set(0);
    this.load();
    this.syncWarehouseQuery();
  }

  onBack(): void {
    const id = this.warehouseId();
    this.navigationHistory.back(id ? ['/inventory/warehouses', id] : ['/inventory/warehouses']);
  }

  load(): void {
    this.requests.next({
      groupBy: this.groupBy(),
      warehouseId: this.warehouseId() ?? undefined,
      productId: this.productId() ?? undefined,
      movementType: this.movementType() || undefined,
      search: this.search() || undefined,
      page: this.page(),
      size: this.rows(),
    });
  }

  getMovementTypeLabel(type: MovementType | string | null): string {
    if (!type) return '';
    const key = MOVEMENT_TYPE_KEYS[type as MovementType];
    return key ? this.translations.t(key) : type;
  }

  getMovementTypeVariant(type: MovementType | string | null): TextBadgeVariant {
    if (!type) return 'secondary';
    return MOVEMENT_TYPE_VARIANTS[type as MovementType] ?? 'secondary';
  }

  getReferenceTypeLabel(type: string | null): string {
    if (!type) return '';
    return this.translations.t(REFERENCE_TYPE_LABELS[type as ReferenceType] ?? type);
  }

  private applyResponse(response: MovementOverviewResponse): void {
    this.displayedGroupBy.set(response.groupBy);
    if (response.groupBy === 'NONE') {
      this.movements.set(response.movements.content);
      this.totalElements.set(response.movements.totalElements);
    } else {
      this.groups.set(response.groups.content);
      this.totalElements.set(response.groups.totalElements);
    }
    this.summary.set(response.summary ?? null);
    this.warehouses.set(response.warehouses ?? []);
    this.products.set(response.products ?? []);
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
