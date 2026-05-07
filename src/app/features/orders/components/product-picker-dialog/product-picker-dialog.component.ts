import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  ViewChild,
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
import { ProductApiService } from '@features/products/services/api/product-api.service';
import { ProductList, ProductStockByWarehouse } from '@features/products/models/interfaces';
import { CategoryApiService } from '@features/categories/services/api/category-api.service';
import { CategoryList } from '@features/categories/models/interfaces';
import { OrderItemFormData } from '@features/orders/models/interfaces';

const PAGE_SIZE = 10;

export interface WarehouseAllocation {
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  available: number;
  requested: number;
}

export interface ProductSelection {
  product: ProductList;
  quantity: number;
  unitPrice: number;
  allocations: WarehouseAllocation[];
}

@Component({
  selector: 'app-product-picker-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogModule, ButtonModule, FormsModule, InputTextModule, InputNumberModule, TooltipModule, PopoverModule, DecimalPipe],
  templateUrl: './product-picker-dialog.component.html',
})
export class ProductPickerDialogComponent implements OnChanges {
  private readonly productApi = inject(ProductApiService);
  private readonly categoryApi = inject(CategoryApiService);

  @ViewChild('stockPopover') private readonly stockPopover!: Popover;

  readonly visible = input<boolean>(false);
  readonly productsAdded = output<OrderItemFormData[]>();
  readonly cancelled = output<void>();

  readonly search = signal<string>('');
  readonly products = signal<ProductList[]>([]);
  readonly totalElements = signal<number>(0);
  readonly totalPages = signal<number>(0);
  readonly currentPage = signal<number>(0);
  readonly loading = signal<boolean>(false);

  readonly selectedIds = signal<Set<string>>(new Set());
  readonly selections = signal<Map<string, ProductSelection>>(new Map());

  readonly popoverProductId = signal<string | null>(null);
  readonly popoverAllocations = signal<WarehouseAllocation[]>([]);
  readonly popoverLoading = signal<boolean>(false);

  readonly filterVisible = signal<boolean>(false);
  readonly filterCategoryId = signal<string | null>(null);
  readonly filterComposite = signal<boolean | null>(null);
  readonly categories = signal<CategoryList[]>([]);

  readonly pageSize = PAGE_SIZE;

  readonly pageLabel = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage() + 1;
    return total > 0 ? `Página ${current} de ${total}` : '';
  });

  readonly selectedCount = computed(() => this.selectedIds().size);

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.filterCategoryId() !== null) count++;
    if (this.filterComposite() !== null) count++;
    return count;
  });

  ngOnChanges(): void {
    if (this.visible()) {
      this.reset();
      this.loadCategories();
      this.load(0);
    }
  }

  onSearchChange(value: string): void {
    this.search.set(value);
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

  toggleSelection(product: ProductList): void {
    const ids = new Set(this.selectedIds());
    const map = new Map(this.selections());

    if (ids.has(product.id)) {
      ids.delete(product.id);
      map.delete(product.id);
    } else {
      ids.add(product.id);
      map.set(product.id, {
        product,
        quantity: 0,
        unitPrice: product.basePrice ?? 0,
        allocations: [],
      });
    }

    this.selectedIds.set(ids);
    this.selections.set(map);
  }

  openStockPopover(event: MouseEvent, product: ProductList): void {
    event.stopPropagation();

    if (this.popoverProductId() === product.id) {
      this.stockPopover.hide();
      this.popoverProductId.set(null);
      return;
    }

    this.popoverProductId.set(product.id);
    this.popoverAllocations.set([]);
    this.popoverLoading.set(true);
    this.stockPopover.show(event);

    this.productApi.getStock(product.id).subscribe({
      next: (stock: ProductStockByWarehouse[]) => {
        const existing = this.selections().get(product.id);
        const existingMap = new Map(
          (existing?.allocations ?? []).map((a) => [a.warehouseId, a.requested]),
        );

        this.popoverAllocations.set(
          stock.map((s) => ({
            warehouseId: s.warehouseId,
            warehouseName: s.warehouseName,
            warehouseCode: s.warehouseId,
            available: s.quantity,
            requested: existingMap.get(s.warehouseId) ?? 0,
          })),
        );
        this.popoverLoading.set(false);
      },
      error: () => this.popoverLoading.set(false),
    });
  }

  closePopover(): void {
    this.stockPopover.hide();
    this.popoverProductId.set(null);
  }

  updateAllocation(index: number, value: number): void {
    const updated = this.popoverAllocations().map((a, i) =>
      i === index ? { ...a, requested: value } : a,
    );
    this.popoverAllocations.set(updated);
  }

  saveAllocation(): void {
    const productId = this.popoverProductId();
    if (!productId) return;

    const allocations = this.popoverAllocations();
    const quantity = allocations.reduce((sum, a) => sum + (a.requested ?? 0), 0);

    const map = new Map(this.selections());
    const existing = map.get(productId);
    if (existing) {
      map.set(productId, { ...existing, quantity, allocations });
    }
    this.selections.set(map);

    if (!this.selectedIds().has(productId)) {
      const product = this.products().find((p) => p.id === productId);
      if (product) {
        const ids = new Set(this.selectedIds());
        ids.add(productId);
        this.selectedIds.set(ids);
        if (!map.has(productId)) {
          map.set(productId, { product, quantity, unitPrice: product.basePrice ?? 0, allocations });
          this.selections.set(map);
        }
      }
    }

    this.popoverProductId.set(null);
  }

  getAllocationQuantity(productId: string): number {
    return this.selections().get(productId)?.quantity ?? 0;
  }

  toggleFilterPanel(): void {
    this.filterVisible.set(!this.filterVisible());
  }

  selectCategory(categoryId: string): void {
    this.filterCategoryId.set(this.filterCategoryId() === categoryId ? null : categoryId);
    this.load(0);
  }

  selectComposite(value: boolean): void {
    this.filterComposite.set(this.filterComposite() === value ? null : value);
    this.load(0);
  }

  clearFilters(): void {
    this.filterCategoryId.set(null);
    this.filterComposite.set(null);
    this.load(0);
  }

  onAdd(): void {
    const items: OrderItemFormData[] = Array.from(this.selections().values()).map((s) => ({
      productId: s.product.id,
      quantity: s.quantity > 0 ? s.quantity : 1,
      unitPrice: s.unitPrice,
    }));
    this.productsAdded.emit(items);
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  private load(page: number): void {
    this.loading.set(true);
    this.popoverProductId.set(null);
    this.productApi
      .getAll({
        search: this.search() || undefined,
        categoryId: this.filterCategoryId() ?? undefined,
        composite: this.filterComposite() ?? undefined,
        active: true,
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

  private reset(): void {
    this.search.set('');
    this.products.set([]);
    this.totalElements.set(0);
    this.totalPages.set(0);
    this.currentPage.set(0);
    this.selectedIds.set(new Set());
    this.selections.set(new Map());
    this.popoverProductId.set(null);
    this.popoverAllocations.set([]);
    this.filterVisible.set(false);
    this.filterCategoryId.set(null);
    this.filterComposite.set(null);
    this.categories.set([]);
  }
}
