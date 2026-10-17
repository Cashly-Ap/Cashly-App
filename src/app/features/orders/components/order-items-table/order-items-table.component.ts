import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { PopoverModule, Popover } from 'primeng/popover';
import { EmptyStateComponent } from '@shared/components/ui/empty-state/empty-state.component';
import { OrderItemFormData } from '@features/orders/models/interfaces/order-form-data.interface';
import { ProductList } from '@features/products/models/interfaces/product-list.interface';
import { ProductPickerDialogComponent } from '@features/orders/components/product-picker-dialog/product-picker-dialog.component';
import { WarehouseAllocation } from '@features/orders/models/interfaces/order-item-allocation.interface';
import { WarehouseStockPopoverComponent } from '@features/orders/components/warehouse-stock-popover/warehouse-stock-popover.component';
import { WarehouseStockEntry } from '@features/orders/components/warehouse-stock-popover/warehouse-stock-entry.interface';

@Component({
  selector: 'app-order-items-table',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    ButtonModule,
    InputNumberModule,
    TooltipModule,
    PopoverModule,
    EmptyStateComponent,
    ProductPickerDialogComponent,
    WarehouseStockPopoverComponent,
  ],
  templateUrl: './order-items-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderItemsTableComponent {
  @ViewChild('allocationPopover') private readonly allocationPopover!: Popover;

  readonly context = input<'order' | 'invoice'>('order');
  readonly items = input<OrderItemFormData[]>([]);
  readonly products = input<ProductList[]>([]);
  readonly customerId = input<string | null>(null);
  readonly customerIds = input<string[]>([]);
  readonly readonly = input<boolean>(false);
  readonly stockMultiplier = input<number>(1);
  readonly itemsChange = output<OrderItemFormData[]>();

  readonly pickerVisible = signal<boolean>(false);
  readonly activeItemIdx = signal<number | null>(null);
  readonly popoverAllocations = signal<WarehouseStockEntry[]>([]);

  readonly excludedProductIds = computed(() => new Set(this.items().map((i) => i.productId)));

  readonly total = computed(() =>
    this.items().reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
  );

  readonly activeItemQuantity = computed<number>(() => {
    const idx = this.activeItemIdx();
    if (idx === null) return 0;
    return this.items()[idx]?.quantity ?? 0;
  });

  readonly allocationTotal = computed(() =>
    this.popoverAllocations().reduce((sum, a) => sum + (a.allocated ?? 0), 0),
  );

  readonly titleLabel = computed(() =>
    this.context() === 'order' ? 'Líneas del Pedido' : 'Líneas de Factura',
  );
  readonly totalLabel = computed(() =>
    this.context() === 'order' ? 'Total Pedido:' : 'Total Factura:',
  );

  openPicker(): void {
    if (!this.customerId()) return;
    this.pickerVisible.set(true);
  }

  onProductsAdded(newItems: OrderItemFormData[]): void {
    const current = this.items();
    const merged = [...current];

    for (const incoming of newItems) {
      const existingIndex = merged.findIndex((i) => i.productId === incoming.productId);
      if (existingIndex >= 0) {
        merged[existingIndex] = { ...merged[existingIndex] };
      } else {
        merged.push({ ...incoming });
      }
    }

    this.itemsChange.emit(merged);
    this.pickerVisible.set(false);
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
              available: s.available,
              allocated: existingMap.get(s.warehouseId) ?? 0,
            };
          })
        : item.warehouseAllocations.map((a) => ({
            warehouseId: a.warehouseId,
            warehouseCode: a.warehouseCode,
            warehouseName: a.warehouseName,
            quantity: a.available,
            reserved: 0,
            available: a.available,
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
    const totalAvailable = this.getItemTotalAvailable(item);
    return item.quantity * this.stockMultiplier() > totalAvailable;
  }

  getItemRequiredStock(item: OrderItemFormData): number {
    return item.quantity * this.stockMultiplier();
  }
}
