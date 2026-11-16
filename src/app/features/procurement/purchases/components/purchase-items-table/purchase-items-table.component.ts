import { LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
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
import { StockAllocationButtonComponent } from '@shared/components/stock-allocation-button/stock-allocation-button.component';
import { WarehouseAllocation } from '@features/sales/orders/models/interfaces/order-item-allocation.interface';
import { WarehouseStockEntry } from '@shared/components/warehouse-stock-dialog/warehouse-stock-entry.interface';
import { SingleWarehouseContext } from '@features/inventory/warehouses/models/interfaces/single-warehouse.interface';

@Component({
  selector: 'app-purchase-items-table',
  standalone: true,
  imports: [
    TranslatePipe,
    LocalizedNumberPipe,
    FormsModule,
    ButtonModule,
    TooltipModule,
    EmptyStateComponent,
    ProductPickerDialogComponent,
    StockAllocationButtonComponent,
  ],
  templateUrl: './purchase-items-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseItemsTableComponent {
  private readonly purchaseApi = inject(PurchaseApiService);

  readonly items = input<PurchaseLineFormData[]>([]);
  readonly products = input<ProductList[]>([]);
  readonly readonly = input<boolean>(false);
  readonly singleWarehouse = input<SingleWarehouseContext | null>(null);
  readonly itemsChange = output<PurchaseLineFormData[]>();

  readonly pickerVisible = signal<boolean>(false);

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

  allocationEntriesFor(item: PurchaseLineFormData): () => WarehouseStockEntry[] {
    return () => {
      const existingMap = new Map(
        item.warehouseAllocations.map((allocation) => [
          allocation.warehouseId,
          allocation.allocated,
        ]),
      );

      return item.stock.length > 0
        ? item.stock.map((stock) => ({
            warehouseId: stock.warehouseId,
            warehouseCode: stock.warehouseCode,
            warehouseName: stock.warehouseName,
            quantity: stock.quantity,
            reserved: stock.reserved,
            available: 999999,
            allocated: existingMap.get(stock.warehouseId) ?? 0,
          }))
        : item.warehouseAllocations.map((allocation) => ({
            warehouseId: allocation.warehouseId,
            warehouseCode: allocation.warehouseCode,
            warehouseName: allocation.warehouseName,
            quantity: allocation.available,
            reserved: 0,
            available: 999999,
            allocated: allocation.allocated,
          }));
    };
  }

  onAllocationSaved(itemIdx: number, entries: WarehouseStockEntry[]): void {
    if (itemIdx < 0 || itemIdx >= this.items().length) return;

    const allocations: WarehouseAllocation[] = entries
      .filter((entry) => entry.allocated > 0)
      .map((entry) => ({
        warehouseId: entry.warehouseId,
        warehouseCode: entry.warehouseCode,
        warehouseName: entry.warehouseName,
        available: entry.available,
        allocated: entry.allocated,
      }));

    const quantity = allocations.reduce((sum, allocation) => sum + allocation.allocated, 0);

    const updated = this.items().map((item, i) => {
      if (i !== itemIdx) return item;
      return { ...item, quantity, warehouseAllocations: allocations };
    });

    this.itemsChange.emit(updated);
  }

  resolveProductName(productId: string): string {
    const item = this.items().find((i) => i.productId === productId);
    if (item?.productCode && item?.productName) return `${item.productCode} — ${item.productName}`;
    const product = this.products().find((p) => p.id === productId);
    return product ? `${product.code} — ${product.name}` : productId;
  }

  warehouseForItem(item: PurchaseLineFormData): SingleWarehouseContext | null {
    const warehouse = this.singleWarehouse();
    if (!warehouse) return null;
    return item.warehouseAllocations.length <= 1 ? warehouse : null;
  }
}
