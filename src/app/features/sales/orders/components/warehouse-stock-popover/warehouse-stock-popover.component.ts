import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { WarehouseStockEntry } from '@features/sales/orders/components/warehouse-stock-popover/warehouse-stock-entry.interface';

@Component({
  selector: 'app-warehouse-stock-popover',
  standalone: true,
  imports: [DecimalPipe, FormsModule, InputNumberModule],
  templateUrl: './warehouse-stock-popover.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehouseStockPopoverComponent {
  readonly entries = input<WarehouseStockEntry[]>([]);
  readonly total = input<number>(0);
  readonly confirmLabel = input<string>('Guardar');
  readonly showStockDetails = input<boolean>(true);
  readonly emptyMessage = input<string>('Sin almacenes disponibles');

  readonly allocationChange = output<{ index: number; value: number }>();
  readonly confirm = output<void>();

  onValueChange(index: number, value: number): void {
    this.allocationChange.emit({ index, value });
  }
}
