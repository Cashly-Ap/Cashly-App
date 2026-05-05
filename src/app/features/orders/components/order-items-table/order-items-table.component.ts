import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { EmptyStateComponent } from '@shared/components/ui';
import { OrderItemFormData } from '@features/orders/models/interfaces';

@Component({
  selector: 'app-order-items-table',
  standalone: true,
  imports: [DecimalPipe, FormsModule, ButtonModule, InputTextModule, InputNumberModule, TooltipModule, EmptyStateComponent],
  templateUrl: './order-items-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderItemsTableComponent {
  readonly items = input<OrderItemFormData[]>([]);
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
}
