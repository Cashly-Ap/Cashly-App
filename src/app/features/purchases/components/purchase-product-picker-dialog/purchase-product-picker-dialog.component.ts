import {
  ChangeDetectionStrategy,
  Component,
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
import { PurchaseProduct } from '@features/purchases/models/interfaces';
import { PurchaseLineFormData } from '@features/purchases/models/interfaces';
import { CategoryApiService } from '@features/categories/services/api/category-api.service';
import { CategoryList } from '@features/categories/models/interfaces';

const PAGE_SIZE = 10;

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
  ],
  templateUrl: './purchase-product-picker-dialog.component.html',
})
export class PurchaseProductPickerDialogComponent {
  private readonly purchaseApi = inject(PurchaseApiService);
  private readonly categoryApi = inject(CategoryApiService);

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
  readonly selections = signal<Map<string, { product: PurchaseProduct; quantity: number; unitCost: number }>>(new Map());

  readonly filterVisible = signal<boolean>(false);
  readonly filterCategoryId = signal<string | null>(null);
  readonly filterComposite = signal<boolean | null>(null);
  readonly categories = signal<CategoryList[]>([]);

  readonly pageSize = PAGE_SIZE;
  readonly String = String;

  readonly compositeOptions = [
    { label: 'Todos los tipos', value: null },
    { label: 'Simple', value: false },
    { label: 'Compuesto', value: true },
  ];

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
    if (this.filterComposite() !== null) count++;
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

  onCompositeChange(value: boolean | null): void {
    this.filterComposite.set(value ?? null);
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

  toggleSelection(product: PurchaseProduct): void {
    const ids = new Set(this.selectedIds());
    const map = new Map(this.selections());

    if (ids.has(product.id)) {
      ids.delete(product.id);
      map.delete(product.id);
    } else {
      ids.add(product.id);
      map.set(product.id, {
        product,
        quantity: 1,
        unitCost: product.purchasePrice,
      });
    }

    this.selectedIds.set(ids);
    this.selections.set(map);
  }

  updateSelectionQuantity(productId: string, quantity: number): void {
    const map = new Map(this.selections());
    const entry = map.get(productId);
    if (entry) {
      map.set(productId, { ...entry, quantity: Math.max(1, quantity) });
      this.selections.set(map);
    }
  }

  updateSelectionUnitCost(productId: string, unitCost: number): void {
    const map = new Map(this.selections());
    const entry = map.get(productId);
    if (entry) {
      map.set(productId, { ...entry, unitCost: Math.max(0, unitCost) });
      this.selections.set(map);
    }
  }

  getSelectedQuantity(productId: string): number {
    return this.selections().get(productId)?.quantity ?? 0;
  }

  getSelectedUnitCost(productId: string): number {
    return this.selections().get(productId)?.unitCost ?? 0;
  }

  toggleFilterPanel(event: MouseEvent): void {
    this.filterVisible.set(!this.filterVisible());
  }

  clearFilters(): void {
    this.filterCategoryId.set(null);
    this.filterComposite.set(null);
    this.load(0);
  }

  onAdd(): void {
    const items: PurchaseLineFormData[] = Array.from(this.selections().values()).map((s) => ({
      productId: s.product.id,
      productCode: s.product.code,
      productName: s.product.name,
      quantity: s.quantity,
      unitCost: s.unitCost,
      stock: [],
      warehouseAllocations: [],
    }));
    this.productsAdded.emit(items);
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onHide(): void {
    this.resetSelectionState();
  }

  private load(page: number): void {
    this.loading.set(true);
    this.purchaseApi
      .getProductsForPurchase({
        search: this.search() || undefined,
        categoryId: this.filterCategoryId() ?? undefined,
        composite: this.filterComposite() ?? undefined,
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
    this.filterVisible.set(false);
  }
}
