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
import { OrderItemFormData } from '@features/sales/orders/models/interfaces/order-form-data.interface';
import { ProductList } from '@features/catalog/products/models/interfaces/product-list.interface';
import { OrderApiService } from '@features/sales/orders/services/api/order-api.service';
import { OrderProduct } from '@features/sales/orders/models/interfaces/order-product.interface';
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
  selector: 'app-order-items-table',
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
  templateUrl: './order-items-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderItemsTableComponent {
  private readonly orderApi = inject(OrderApiService);

  readonly context = input<'order' | 'invoice' | 'quote'>('order');
  readonly items = input<OrderItemFormData[]>([]);
  readonly products = input<ProductList[]>([]);
  readonly customerId = input<string | null>(null);
  readonly customerIds = input<string[]>([]);
  readonly readonly = input<boolean>(false);
  readonly stockMultiplier = input<number>(1);
  readonly singleWarehouse = input<SingleWarehouseContext | null>(null);
  readonly itemsChange = output<OrderItemFormData[]>();

  readonly pickerVisible = signal<boolean>(false);

  readonly excludedProductIds = computed(() => new Set(this.items().map((i) => i.productId)));

  readonly loadProducts = (filters: ProductPickerFilters): Observable<ProductPickerPage> =>
    this.orderApi
      .getProductsForOrder({
        customerId: this.customerId() ?? '',
        customerIds: this.customerIds(),
        search: filters.search,
        categoryId: filters.categoryId,
        composite: filters.composite,
        withStock: filters.withStock,
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
    this.items().reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
  );

  readonly titleLabel = computed(() => {
    if (this.context() === 'quote') return 'sales.quotes.quoteLines';
    if (this.context() === 'invoice') return 'sales.orders.invoiceLines';
    return 'sales.orders.orderLines';
  });
  readonly totalLabel = computed(() => {
    if (this.context() === 'quote') return 'sales.quotes.quoteTotal';
    if (this.context() === 'invoice') return 'sales.orders.invoiceTotal';
    return 'sales.orders.orderTotal';
  });

  openPicker(): void {
    if (!this.customerId()) return;
    this.pickerVisible.set(true);
  }

  onProductsAdded(selections: ProductPickerSelection[]): void {
    const current = this.items();
    const merged = [...current];

    for (const selection of selections) {
      const incoming = this.toOrderItem(selection);
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

  private toOrderItem(selection: ProductPickerSelection): OrderItemFormData {
    return {
      productId: selection.product.id,
      productCode: selection.product.code,
      productName: selection.product.name,
      quantity: selection.quantity,
      unitPrice: selection.unitPrice,
      stock: selection.product.stockItems,
      warehouseAllocations: selection.allocations,
    };
  }

  private toPickerItem(product: OrderProduct): ProductPickerItem {
    return {
      id: product.id,
      code: product.code,
      name: product.name,
      categoryName: product.categoryName,
      active: product.active,
      composite: product.composite,
      price: product.customerPrice,
      totalStock: product.totalStock,
      stockItems: product.stock,
    };
  }

  onPickerCancelled(): void {
    this.pickerVisible.set(false);
  }

  removeItem(index: number): void {
    const updated = this.items().filter((_, i) => i !== index);
    this.itemsChange.emit(updated);
  }

  allocationEntriesFor(item: OrderItemFormData): () => WarehouseStockEntry[] {
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
            available: stock.available,
            allocated: existingMap.get(stock.warehouseId) ?? 0,
          }))
        : item.warehouseAllocations.map((allocation) => ({
            warehouseId: allocation.warehouseId,
            warehouseCode: allocation.warehouseCode,
            warehouseName: allocation.warehouseName,
            quantity: allocation.available,
            reserved: 0,
            available: allocation.available,
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

  resolveProductStock(productId: string): number | null {
    const item = this.items().find((i) => i.productId === productId);
    if (item?.stock) return item.stock.reduce((sum, s) => sum + s.quantity, 0);
    const product = this.products().find((p) => p.id === productId);
    return product?.stockTotal ?? null;
  }

  getItemTotalReserved(item: OrderItemFormData): number {
    return (item.stock ?? []).reduce((sum, s) => sum + (s.reserved ?? 0), 0);
  }

  getItemTotalAvailable(item: OrderItemFormData): number {
    return (item.stock ?? []).reduce((sum, s) => sum + (s.available ?? 0), 0);
  }

  isItemOverAllocated(item: OrderItemFormData): boolean {
    if (this.context() === 'quote') return false;
    const totalAvailable = this.getItemTotalAvailable(item);
    return item.quantity * this.stockMultiplier() > totalAvailable;
  }

  getItemRequiredStock(item: OrderItemFormData): number {
    return item.quantity * this.stockMultiplier();
  }

  warehouseForItem(item: OrderItemFormData): SingleWarehouseContext | null {
    const warehouse = this.singleWarehouse();
    if (!warehouse) return null;
    return item.warehouseAllocations.length <= 1 ? warehouse : null;
  }
}
