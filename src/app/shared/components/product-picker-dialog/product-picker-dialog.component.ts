import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { CategoryApiService } from '@features/catalog/categories/services/api/category-api.service';
import { CategoryList } from '@features/catalog/categories/models/interfaces/category-list.interface';
import { SingleWarehouseContext } from '@features/inventory/warehouses/models/interfaces/single-warehouse.interface';
import { WarehouseStockEntry } from '@shared/components/warehouse-stock-dialog/warehouse-stock-entry.interface';
import { StockAllocationButtonComponent } from '@shared/components/stock-allocation-button/stock-allocation-button.component';
import { ListFilterComponent } from '@shared/components/list/list-filter/list-filter.component';
import { CancelButtonComponent } from '@shared/components/ui/cancel-button/cancel-button.component';
import { SubmitButtonComponent } from '@shared/components/ui/submit-button/submit-button.component';
import { TableCardComponent } from '@shared/components/ui/table-card/table-card.component';
import { DialogHeaderComponent } from '@shared/components/ui/dialog-header/dialog-header.component';
import { TableRowSkeletonComponent } from '@shared/components/ui/skeletons/table-row-skeleton.component';
import { CardSkeletonComponent } from '@shared/components/ui/skeletons/card-skeleton.component';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';
import {
  ProductPickerFilters,
  ProductPickerItem,
  ProductPickerLoader,
  ProductPickerMode,
  ProductPickerSelection,
  ProductPickerStockItem,
} from '@shared/components/product-picker-dialog/product-picker.models';

const PAGE_SIZE = 10;

type RememberedAllocation = { warehouseId: string; allocated: number };

@Component({
  selector: 'app-product-picker-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableRowSkeletonComponent,
    CardSkeletonComponent,
    DialogHeaderComponent,
    TableCardComponent,
    SubmitButtonComponent,
    CancelButtonComponent,
    ListFilterComponent,
    TranslateOptionsPipe,
    TranslatePipe,
    LocalizedNumberPipe,
    DialogModule,
    ButtonModule,
    FormsModule,
    SelectModule,
    StockAllocationButtonComponent,
    SearchFieldComponent,
  ],
  templateUrl: './product-picker-dialog.component.html',
})
export class ProductPickerDialogComponent {
  private readonly categoryApi = inject(CategoryApiService);

  readonly visible = input<boolean>(false);
  readonly mode = input<ProductPickerMode>('sale');
  readonly allowUnlimitedStock = input<boolean>(false);
  readonly excludedProductIds = input<Set<string>>(new Set());
  readonly singleWarehouse = input<SingleWarehouseContext | null>(null);
  readonly loadProducts = input.required<ProductPickerLoader>();
  readonly productsSelected = output<ProductPickerSelection[]>();
  readonly cancelled = output<void>();

  readonly search = signal<string>('');
  readonly products = signal<ProductPickerItem[]>([]);
  readonly totalElements = signal<number>(0);
  readonly totalPages = signal<number>(0);
  readonly currentPage = signal<number>(0);
  readonly loading = signal<boolean>(false);

  readonly selectedIds = signal<Set<string>>(new Set());
  readonly selections = signal<Map<string, ProductPickerSelection>>(new Map());

  private readonly allocationMemory = new Map<string, RememberedAllocation[]>();

  readonly filterCategoryId = signal<string | null>(null);
  readonly filterComposite = signal<boolean | null>(null);
  readonly filterWithStock = signal<boolean>(true);
  readonly categories = signal<CategoryList[]>([]);

  readonly pageSize = PAGE_SIZE;
  readonly String = String;

  readonly isPurchase = computed(() => this.mode() === 'purchase');

  readonly subtitleKey = computed(() =>
    this.isPurchase()
      ? 'procurement.purchases.findAndSelectProductsToAddToThePurchase'
      : 'sales.orders.findAndSelectProductsToAddToTheOrder',
  );

  readonly categoryOptions = computed(() => [
    { label: 'Todas las categorías', value: null },
    ...this.categories().map((category) => ({ label: category.name, value: category.id })),
  ]);

  readonly compositeOptions = [
    { label: 'Todos los tipos', value: null },
    { label: 'Simple', value: false },
    { label: 'Compuesto', value: true },
  ];

  readonly withStockOptions = [
    { label: 'Con stock', value: true },
    { label: 'Sin stock', value: false },
  ];

  readonly pageLabel = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage() + 1;
    return total > 0 ? `Página ${current} de ${total}` : '';
  });

  readonly visibleProducts = computed(() =>
    this.products().filter((product) => !this.excludedProductIds().has(product.id)),
  );

  readonly selectedCount = computed(() => this.selectedIds().size);

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.filterCategoryId() !== null) count++;
    if (this.filterComposite() !== null) count++;
    if (!this.isPurchase() && !this.allowUnlimitedStock() && this.filterWithStock() !== true)
      count++;
    return count;
  });

  private initialized = false;

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.initialized = false;
      }
    });
  }

  onDialogShow(): void {
    if (!this.initialized) {
      this.initialized = true;
      this.loadCategories();
      this.load(0);
    }
    this.resetSelectionState();
  }

  onSearchChange(value: string): void {
    this.search.set(value);
    this.load(0);
  }

  onCategoryChange(value: string | null): void {
    this.filterCategoryId.set(value ?? null);
    this.load(0);
  }

  onCompositeChange(value: boolean | null): void {
    this.filterComposite.set(value ?? null);
    this.load(0);
  }

  onWithStockChange(value: boolean): void {
    this.filterWithStock.set(value);
    this.load(0);
  }

  onPagePrev(): void {
    if (this.currentPage() > 0) {
      this.load(this.currentPage() - 1);
    }
  }

  onPageNext(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.load(this.currentPage() + 1);
    }
  }

  isSelected(productId: string): boolean {
    return this.selectedIds().has(productId);
  }

  canSelectProduct(product: ProductPickerItem): boolean {
    if (this.isPurchase()) return product.active;
    if (this.allowUnlimitedStock()) return true;
    return this.getTotalAvailable(product) > 0;
  }

  toggleSelection(product: ProductPickerItem): void {
    if (!this.isSelected(product.id) && !this.canSelectProduct(product)) return;

    const ids = new Set(this.selectedIds());
    const map = new Map(this.selections());

    if (ids.has(product.id)) {
      this.rememberAllocations(product.id, map.get(product.id)?.allocations ?? []);
      ids.delete(product.id);
      map.delete(product.id);
    } else {
      const allocations = this.buildAllocations(
        product.stockItems,
        this.rememberedAllocations(product.id),
      );
      const quantity = allocations.reduce((sum, allocation) => sum + allocation.allocated, 0);
      ids.add(product.id);
      map.set(product.id, {
        product,
        quantity,
        unitPrice: product.price,
        allocations,
      });
    }

    this.selectedIds.set(ids);
    this.selections.set(map);
  }

  stockEntriesFor(product: ProductPickerItem): () => WarehouseStockEntry[] {
    return () => {
      const existing = this.selections().get(product.id);
      const allocations = existing?.allocations ?? this.allocationMemory.get(product.id) ?? [];
      const existingMap = new Map(
        allocations.map((allocation) => [allocation.warehouseId, allocation.allocated]),
      );
      return this.buildAllocations(product.stockItems, existingMap);
    };
  }

  productLabelFor(product: ProductPickerItem): string {
    return `${product.code} — ${product.name}`;
  }

  onStockSaved(product: ProductPickerItem, allocations: WarehouseStockEntry[]): void {
    const normalized = allocations.map((allocation) => ({
      ...allocation,
      allocated: allocation.allocated ?? 0,
    }));
    this.rememberAllocations(product.id, normalized);
    const quantity = normalized.reduce((sum, allocation) => sum + allocation.allocated, 0);
    const ids = new Set(this.selectedIds());
    const map = new Map(this.selections());

    if (quantity === 0) {
      ids.delete(product.id);
      map.delete(product.id);
    } else {
      ids.add(product.id);
      map.set(product.id, {
        product,
        quantity,
        unitPrice: product.price,
        allocations: normalized,
      });
    }

    this.selectedIds.set(ids);
    this.selections.set(map);
  }

  getAllocationQuantity(productId: string): number {
    return this.selections().get(productId)?.quantity ?? 0;
  }

  getTotalAvailable(product: ProductPickerItem): number {
    const warehouse = this.singleWarehouse();
    const stockItems = warehouse
      ? product.stockItems.filter((stock) => stock.warehouseId === warehouse.id)
      : product.stockItems;
    return stockItems.reduce((sum, stock) => sum + stock.available, 0);
  }

  clearFilters(): void {
    this.filterCategoryId.set(null);
    this.filterComposite.set(null);
    this.filterWithStock.set(true);
    this.load(0);
  }

  onAdd(): void {
    this.productsSelected.emit(Array.from(this.selections().values()));
  }

  onPickerKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter') return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('app-search-field') || target?.closest('button')) return;
    if (this.selectedCount() === 0) return;
    event.preventDefault();
    this.onAdd();
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onHide(): void {
    this.resetSelectionState();
  }

  private buildAllocations(
    stockItems: ProductPickerStockItem[],
    existingMap: Map<string, number>,
  ): WarehouseStockEntry[] {
    const warehouse = this.singleWarehouse();
    const defaultAllocated = (stock: ProductPickerStockItem) =>
      this.isPurchase() || warehouse ? 0 : stock.available;
    const available = (stock: ProductPickerStockItem) =>
      this.isPurchase() ? 999999 : stock.available;

    const entries = stockItems
      .filter((stock) => !warehouse || stock.warehouseId === warehouse.id)
      .map((stock) => ({
        warehouseId: stock.warehouseId,
        warehouseName: stock.warehouseName,
        warehouseCode: stock.warehouseCode,
        quantity: stock.quantity,
        reserved: stock.reserved,
        available: available(stock),
        allocated:
          existingMap.size > 0
            ? (existingMap.get(stock.warehouseId) ?? 0)
            : defaultAllocated(stock),
      }));

    if (warehouse && entries.length === 0) {
      entries.push({
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        warehouseCode: warehouse.code,
        quantity: 0,
        reserved: 0,
        available: this.isPurchase() ? 999999 : 0,
        allocated: existingMap.get(warehouse.id) ?? 0,
      });
    }

    return entries;
  }

  private load(page: number): void {
    this.loading.set(true);
    this.loadProducts()(this.buildFilters(page)).subscribe({
      next: (response) => {
        this.products.set(response.content);
        this.totalElements.set(response.totalElements);
        this.totalPages.set(response.totalPages);
        this.currentPage.set(response.number);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private buildFilters(page: number): ProductPickerFilters {
    return {
      search: this.search() || undefined,
      categoryId: this.filterCategoryId() ?? undefined,
      composite: this.filterComposite() ?? undefined,
      withStock:
        this.isPurchase() || this.allowUnlimitedStock() ? undefined : this.filterWithStock(),
      page,
      size: PAGE_SIZE,
    };
  }

  private loadCategories(): void {
    this.categoryApi.getAll({ active: true, size: 100 }).subscribe({
      next: (response) => this.categories.set(response.content),
      error: () => {},
    });
  }

  private resetSelectionState(): void {
    this.search.set('');
    this.currentPage.set(0);
    this.selectedIds.set(new Set());
    this.selections.set(new Map());
    this.allocationMemory.clear();
  }

  private rememberAllocations(productId: string, allocations: RememberedAllocation[]): void {
    this.allocationMemory.set(
      productId,
      allocations.map((allocation) => ({
        warehouseId: allocation.warehouseId,
        allocated: allocation.allocated,
      })),
    );
  }

  private rememberedAllocations(productId: string): Map<string, number> {
    return new Map(
      (this.allocationMemory.get(productId) ?? []).map((allocation) => [
        allocation.warehouseId,
        allocation.allocated,
      ]),
    );
  }
}
