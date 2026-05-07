import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { EmptyStateComponent } from '@shared/components/ui';
import { OrderItemFormData } from '@features/orders/models/interfaces';
import { ProductList } from '@features/products/models/interfaces';
import { ProductPickerDialogComponent } from '@features/orders/components/product-picker-dialog/product-picker-dialog.component';

@Component({
  selector: 'app-order-items-table',
  standalone: true,
  imports: [DecimalPipe, FormsModule, ButtonModule, InputNumberModule, TooltipModule, EmptyStateComponent, ProductPickerDialogComponent],
  templateUrl: './order-items-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderItemsTableComponent {
  readonly items = input<OrderItemFormData[]>([]);
  readonly products = input<ProductList[]>([]);
  readonly customerId = input<string | null>(null);
  readonly readonly = input<boolean>(false);
  readonly itemsChange = output<OrderItemFormData[]>();

  readonly pickerVisible = signal<boolean>(false);

  readonly total = computed(() =>
    this.items().reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
  );

  openPicker(): void {
    if (!this.customerId()) return;
    this.pickerVisible.set(true);
  }

  onProductsAdded(newItems: OrderItemFormData[]): void {
    const current = this.items();
    const merged = [...current];

    for (const incoming of newItems) {
      const stock = this.resolveProductStock(incoming.productId);
      const existingIndex = merged.findIndex((i) => i.productId === incoming.productId);

      if (existingIndex >= 0) {
        const combined = merged[existingIndex].quantity + incoming.quantity;
        const clamped = stock != null ? Math.min(combined, stock) : combined;
        merged[existingIndex] = { ...merged[existingIndex], quantity: clamped };
      } else {
        const clamped = stock != null ? Math.min(incoming.quantity, stock) : incoming.quantity;
        merged.push({ ...incoming, quantity: clamped });
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

  updateItem(index: number, field: keyof OrderItemFormData, value: string | number): void {
    const updated = this.items().map((item, i) => {
      if (i !== index) return item;
      return { ...item, [field]: value };
    });
    this.itemsChange.emit(updated);
  }

  resolveProductName(productId: string): string {
    const product = this.products().find((p) => p.id === productId);
    return product ? `${product.code} — ${product.name}` : productId;
  }

  resolveProductStock(productId: string): number | null {
    const product = this.products().find((p) => p.id === productId);
    return product?.stockTotal ?? null;
  }
}
