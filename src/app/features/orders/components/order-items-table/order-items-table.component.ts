import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { EmptyStateComponent } from '@shared/components/ui';
import { OrderItemFormData } from '@features/orders/models/interfaces';
import { ProductList } from '@features/products/models/interfaces';

@Component({
  selector: 'app-order-items-table',
  standalone: true,
  imports: [DecimalPipe, FormsModule, ButtonModule, InputNumberModule, SelectModule, TooltipModule, EmptyStateComponent],
  templateUrl: './order-items-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderItemsTableComponent {
  readonly items = input<OrderItemFormData[]>([]);
  readonly products = input<ProductList[]>([]);
  readonly readonly = input<boolean>(false);
  readonly itemsChange = output<OrderItemFormData[]>();

  readonly total = computed(() =>
    this.items().reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
  );

  addItem(): void {
    const updated = [...this.items(), { productId: '', quantity: 1, unitPrice: 0 }];
    this.itemsChange.emit(updated);
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
}
