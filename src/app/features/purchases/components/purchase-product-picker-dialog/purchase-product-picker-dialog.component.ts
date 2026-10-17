import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  effect,
  inject,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { Popover, PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { PurchaseApiService } from '@features/purchases/services/api/purchase-api.service';
import { PurchaseProduct } from '@features/purchases/models/interfaces/purchase-product.interface';
import { PurchaseLineFormData } from '@features/purchases/models/interfaces/purchase-form-data.interface';
import { CategoryApiService } from '@features/categories/services/api/category-api.service';
import { CategoryList } from '@features/categories/models/interfaces/category-list.interface';
import { WarehouseStockPopoverComponent } from '@features/orders/components/warehouse-stock-popover/warehouse-stock-popover.component';
import { WarehouseStockEntry } from '@features/orders/components/warehouse-stock-popover/warehouse-stock-entry.interface';
import { SearchFieldComponent } from '@shared/components/ui/search-field/search-field.component';

const PAGE_SIZE = 10;

export interface WarehouseAllocation {
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  available: number;
  allocated: number;
}

interface ProductSelection {
  product: PurchaseProduct;
  quantity: number;
  unitCost: number;
  allocations: WarehouseAllocation[];
}

@Component({
  selector: 'app-purchase-product-picker-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DialogModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
    TooltipModule,
    PopoverModule,
    DecimalPipe,
    SelectModule,
    WarehouseStockPopoverComponent,
    SearchFieldComponent,
  ],
  templateUrl: './purchase-product-picker-dialog.component.html',
})
export class PurchaseProductPickerDialogComponent {
  private readonly purchaseApi = inject(PurchaseApiService);
  private readonly categoryApi = inject(CategoryApiService);

  @ViewChild('stockPopover') private readonly stockPopover!: Popover;

  readonly visible = input<boolean>(false);
  readonly excludedProductIds = input<Set<string>>(new Set());
  readonly productsAdded = output<PurchaseLineFormData[]>();
  readonly cancelled = output<void>();

  readonly search = signal<string>('');
  readonly products = signal<PurchaseProduct[]>([]);
  readonly totalElements = signal<number>(0);
  readonly totalPages = signal<number>(0);
  readonly currentPage = signal<number>(0);
  readonly loading = signal<boolean>(false);

  readonly selectedIds = signal<Set<string>>(new Set());
  readonly selections = signal<Map<string, ProductSelection>>(new Map());

  readonly popoverProductId = signal<string | null>(null);
  readonly popoverAllocations = signal<WarehouseStockEntry[]>([]);

  readonly filterVisible = signal<boolean>(false);
  readonly filterCategoryId = signal<string | null>(null);
  readonly categories = signal<CategoryList[]>([]);

  readonly pageSize = PAGE_SIZE;
  readonly String = String;

  readonly categoryOptions = computed(() => [
    { label: 'Todas las categorías', value: null },
    ...this.categories().map((c) => ({ label: c.name, value: c.id })),
  ]);

  readonly pageLabel = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage() + 1;
    return total > 0 ? `Página ${current} de ${total}` : '';
  });

  readonly visibleProducts = computed(() =>
    this.products().filter((p) => !this.excludedProductIds().has(p.id)),
  );

  readonly selectedCount = computed(() => this.selectedIds().size);

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.filterCategoryId() !== null) count++;
    return count;
  });

  private initialized = false;

  constructor() {
    effect(() => {
      this.visible();
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

  canSelectProduct(product: PurchaseProduct): boolean {
    return product.active;
  }

  toggleSelection(product: PurchaseProduct): void {
    if (!this.isSelected(product.id) && !this.canSelectProduct(product)) return;

    const ids = new Set(this.selectedIds());
    const map = new Map(this.selections());

    if (ids.has(product.id)) {
      ids.delete(product.id);
      map.delete(product.id);
    } else {
      const allocations = this.buildAllocations(product.stockItems ?? [], new Map());
      const quantity = allocations.reduce((sum, a) => sum + a.allocated, 0);
      ids.add(product.id);
      map.set(product.id, { product, quantity, unitCost: 0, allocations });
    }

    this.selectedIds.set(ids);
    this.selections.set(map);
  }

  openStockPopover(event: MouseEvent, product: PurchaseProduct): void {
    event.stopPropagation();
    if (this.popoverProductId() === product.id) {
      this.stockPopover.hide();
      this.popoverProductId.set(null);
      return;
    }
    const existing = this.selections().get(product.id);
    const existingMap = new Map(
      (existing?.allocations ?? []).map((a) => [a.warehouseId, a.allocated]),
    );
    this.popoverProductId.set(product.id);
    this.popoverAllocations.set(this.buildAllocations(product.stockItems ?? [], existingMap));
    this.stockPopover.show(event);
  }

  closePopover(): void {
    this.stockPopover.hide();
    this.popoverProductId.set(null);
  }

  updateAllocation(index: number, value: number): void {
    const updated = this.popoverAllocations().map((a, i) =>
      i === index ? { ...a, allocated: value } : a,
    );
    this.popoverAllocations.set(updated);
  }

  saveAllocation(): void {
    const productId = this.popoverProductId();
    if (!productId) return;
    const allocations = this.popoverAllocations().map((a) => ({
      ...a,
      allocated: a.allocated ?? 0,
    }));
    const quantity = allocations.reduce((sum, a) => sum + a.allocated, 0);
    const map = new Map(this.selections());
    const existing = map.get(productId);
    if (existing) {
      if (quantity === 0) {
        const ids = new Set(this.selectedIds());
        ids.delete(productId);
        this.selectedIds.set(ids);
        map.delete(productId);
      } else {
        map.set(productId, { ...existing, quantity, allocations });
      }
    } else if (quantity > 0) {
      const product = this.products().find((p) => p.id === productId);
      if (product) {
        map.set(productId, { product, quantity, unitCost: 0, allocations });
        const ids = new Set(this.selectedIds());
        ids.add(productId);
        this.selectedIds.set(ids);
      }
    }
    this.selections.set(map);
    this.stockPopover.hide();
    this.popoverProductId.set(null);
  }

  getAllocationQuantity(productId: string): number {
    return this.selections().get(productId)?.quantity ?? 0;
  }

  getTotalReserved(product: PurchaseProduct): number {
    return (product.stockItems ?? []).reduce((sum, s) => sum + s.reserved, 0);
  }

  getTotalAvailable(product: PurchaseProduct): number {
    return (product.stockItems ?? []).reduce((sum, s) => sum + s.available, 0);
  }

  toggleFilterPanel(event: MouseEvent): void {
    this.filterVisible.set(!this.filterVisible());
  }

  clearFilters(): void {
    this.filterCategoryId.set(null);
    this.load(0);
  }

  onAdd(): void {
    const items: PurchaseLineFormData[] = Array.from(this.selections().values()).map((s) => ({
      productId: s.product.id,
      productCode: s.product.code,
      productName: s.product.name,
      stock: (s.product.stockItems ?? []).map((si) => ({
        warehouseId: si.warehouseId,
        warehouseName: si.warehouseName,
        warehouseCode: si.warehouseCode,
        quantity: si.quantity,
        reserved: si.reserved,
        available: si.available,
      })),
      quantity: s.quantity,
      unitCost: s.product.purchasePrice,
      warehouseAllocations: s.allocations.map((a) => ({
        warehouseId: a.warehouseId,
        warehouseCode: a.warehouseCode,
        warehouseName: a.warehouseName,
        available: a.available,
        allocated: a.allocated,
      })),
    }));
    this.productsAdded.emit(items);
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onHide(): void {
    this.resetSelectionState();
  }

  private buildAllocations(
    stockItems: PurchaseProduct['stockItems'],
    existingMap: Map<string, number>,
  ): WarehouseStockEntry[] {
    if (!stockItems) return [];
    return stockItems.map((s) => ({
      warehouseId: s.warehouseId,
      warehouseName: s.warehouseName,
      warehouseCode: s.warehouseCode,
      quantity: s.quantity,
      reserved: s.reserved,
      available: 999999,
      allocated: existingMap.size > 0 ? (existingMap.get(s.warehouseId) ?? 0) : 0,
    }));
  }

  private load(page: number): void {
    this.loading.set(true);
    this.popoverProductId.set(null);
    this.purchaseApi
      .getProductsForPurchase({
        search: this.search() || undefined,
        categoryId: this.filterCategoryId() ?? undefined,
        page,
        size: PAGE_SIZE,
      })
      .subscribe({
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
    this.popoverProductId.set(null);
    this.popoverAllocations.set([]);
    this.filterVisible.set(false);
  }
}
