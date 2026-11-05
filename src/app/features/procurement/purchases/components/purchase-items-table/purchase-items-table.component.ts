import { LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule, Popover } from 'primeng/popover';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { PurchaseLineFormData } from '@features/procurement/purchases/models/interfaces/purchase-form-data.interface';
import { PurchaseProduct } from '@features/procurement/purchases/models/interfaces/purchase-product.interface';
import { PurchaseApiService } from '@features/procurement/purchases/services/api/purchase-api.service';
import { ProductList } from '@features/catalog/products/models/interfaces/product-list.interface';
import { ProductPickerDialogComponent } from '@shared/components/product-picker-dialog/product-picker-dialog.component';
import {
  ProductPickerFilters,
  ProductPickerItem,
  ProductPickerPage,
  ProductPickerSelection,
} from '@shared/components/product-picker-dialog/product-picker.models';
import { WarehouseAllocation } from '@features/sales/orders/models/interfaces/order-item-allocation.interface';
import { WarehouseStockPopoverComponent } from '@features/sales/orders/components/warehouse-stock-popover/warehouse-stock-popover.component';
import { WarehouseStockEntry } from '@features/sales/orders/components/warehouse-stock-popover/warehouse-stock-entry.interface';

@Component({
  selector: 'app-purchase-items-table',
  standalone: true,
  imports: [
    TranslatePipe,
    LocalizedNumberPipe,
    FormsModule,
    ButtonModule,
    InputNumberModule,
    TooltipModule,
    PopoverModule,
    EmptyStateComponent,
    ProductPickerDialogComponent,
    WarehouseStockPopoverComponent,
  ],
  templateUrl: './purchase-items-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseItemsTableComponent {
  @ViewChild('allocationPopover') private readonly allocationPopover!: Popover;
  private readonly purchaseApi = inject(PurchaseApiService);

  readonly items = input<PurchaseLineFormData[]>([]);
  readonly products = input<ProductList[]>([]);
  readonly readonly = input<boolean>(false);
  readonly itemsChange = output<PurchaseLineFormData[]>();

  readonly pickerVisible = signal<boolean>(false);
  readonly activeItemIdx = signal<number | null>(null);
  readonly popoverAllocations = signal<WarehouseStockEntry[]>([]);

  readonly excludedProductIds = computed(() => new Set(this.items().map((i) => i.productId)));

  readonly loadProducts = (filters: ProductPickerFilters): Observable<ProductPickerPage> =>
    this.purchaseApi
      .getProductsForPurchase({
        search: filters.search,
        categoryId: filters.categoryId,
        composite: filters.composite,
        page: filters.page,
        size: filters.size,
      })
      .pipe(
        map((response) => ({
          content: response.content.map((product) => this.toPickerItem(product)),
          totalElements: response.totalElements,
          totalPages: response.totalPages,
          number: response.number,
        })),
      );

  readonly total = computed(() =>
    this.items().reduce((sum, i) => sum + i.quantity * i.unitCost, 0),
  );

  readonly activeItemQuantity = computed<number>(() => {
    const idx = this.activeItemIdx();
    if (idx === null) return 0;
    return this.items()[idx]?.quantity ?? 0;
  });

  readonly allocationTotal = computed(() =>
    this.popoverAllocations().reduce((sum, a) => sum + (a.allocated ?? 0), 0),
  );

  openPicker(): void {
    this.pickerVisible.set(true);
  }

  onProductsAdded(selections: ProductPickerSelection[]): void {
    const current = this.items();
    const merged = [...current];

    for (const selection of selections) {
      const incoming = this.toPurchaseLine(selection);
      const existingIndex = merged.findIndex((i) => i.productId === incoming.productId);
      if (existingIndex >= 0) {
        merged[existingIndex] = { ...merged[existingIndex] };
      } else {
        merged.push(incoming);
      }
    }

    this.itemsChange.emit(merged);
    this.pickerVisible.set(false);
  }

  private toPurchaseLine(selection: ProductPickerSelection): PurchaseLineFormData {
    return {
      productId: selection.product.id,
      productCode: selection.product.code,
      productName: selection.product.name,
      quantity: selection.quantity,
      unitCost: selection.unitPrice,
      stock: selection.product.stockItems,
      warehouseAllocations: selection.allocations,
    };
  }

  private toPickerItem(product: PurchaseProduct): ProductPickerItem {
    return {
      id: product.id,
      code: product.code,
      name: product.name,
      categoryName: product.categoryName,
      active: product.active,
      price: product.purchasePrice,
      totalStock: product.stock,
      stockItems: product.stockItems,
    };
  }

  onPickerCancelled(): void {
    this.pickerVisible.set(false);
  }

  removeItem(index: number): void {
    const updated = this.items().filter((_, i) => i !== index);
    this.itemsChange.emit(updated);
  }

  openAllocationPopover(event: MouseEvent, itemIdx: number): void {
    event.stopPropagation();

    if (this.activeItemIdx() === itemIdx) {
      this.allocationPopover.hide();
      this.activeItemIdx.set(null);
      return;
    }

    const item = this.items()[itemIdx];
    if (!item) return;

    const existingMap = new Map(item.warehouseAllocations.map((a) => [a.warehouseId, a.allocated]));

    const allocations: WarehouseStockEntry[] =
      item.stock.length > 0
        ? item.stock.map((s) => {
            const existingAlloc = item.warehouseAllocations.find(
              (a) => a.warehouseId === s.warehouseId,
            );
            return {
              warehouseId: s.warehouseId,
              warehouseCode: s.warehouseCode,
              warehouseName: s.warehouseName,
              quantity: s.quantity,
              reserved: s.reserved,
              available: 999999,
              allocated: existingMap.get(s.warehouseId) ?? 0,
            };
          })
        : item.warehouseAllocations.map((a) => ({
            warehouseId: a.warehouseId,
            warehouseCode: a.warehouseCode,
            warehouseName: a.warehouseName,
            quantity: a.available,
            reserved: 0,
            available: 999999,
            allocated: a.allocated,
          }));

    this.activeItemIdx.set(itemIdx);
    this.popoverAllocations.set(allocations);
    this.allocationPopover.show(event);
  }

  updatePopoverAllocation(index: number, value: number): void {
    const updated = this.popoverAllocations().map((a, i) =>
      i === index ? { ...a, allocated: value } : a,
    );
    this.popoverAllocations.set(updated);
  }

  confirmAllocations(): void {
    const itemIdx = this.activeItemIdx();
    if (itemIdx === null) return;

    const allocations: WarehouseAllocation[] = this.popoverAllocations()
      .filter((a) => a.allocated > 0)
      .map((a) => ({
        warehouseId: a.warehouseId,
        warehouseCode: a.warehouseCode,
        warehouseName: a.warehouseName,
        available: a.available,
        allocated: a.allocated,
      }));

    const quantity = allocations.reduce((sum, a) => sum + a.allocated, 0);

    const updated = this.items().map((item, i) => {
      if (i !== itemIdx) return item;
      return { ...item, quantity, warehouseAllocations: allocations };
    });

    this.itemsChange.emit(updated);
    this.allocationPopover.hide();
    this.activeItemIdx.set(null);
  }

  resolveProductName(productId: string): string {
    const item = this.items().find((i) => i.productId === productId);
    if (item?.productCode && item?.productName) return `${item.productCode} — ${item.productName}`;
    const product = this.products().find((p) => p.id === productId);
    return product ? `${product.code} — ${product.name}` : productId;
  }
}
