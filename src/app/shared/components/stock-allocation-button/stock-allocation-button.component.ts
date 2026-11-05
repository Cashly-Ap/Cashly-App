import { TranslatePipe } from '@core/i18n/translate.pipe';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { WarehouseStockDialogComponent } from '@shared/components/warehouse-stock-dialog/warehouse-stock-dialog.component';
import { WarehouseStockEntry } from '@shared/components/warehouse-stock-dialog/warehouse-stock-entry.interface';

@Component({
  selector: 'app-stock-allocation-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, WarehouseStockDialogComponent],
  templateUrl: './stock-allocation-button.component.html',
})
export class StockAllocationButtonComponent {
  readonly buildEntries = input.required<() => WarehouseStockEntry[]>();
  readonly productLabel = input<string | null>(null);
  readonly showStockDetails = input<boolean>(true);
  readonly unlimited = input<boolean>(false);
  readonly emptyMessageKey = input('procurement.purchases.noWarehousesAvailableForThisProduct');

  readonly saved = output<WarehouseStockEntry[]>();

  readonly dialogVisible = signal<boolean>(false);
  readonly dialogEntries = signal<WarehouseStockEntry[]>([]);

  open(event: MouseEvent): void {
    event.stopPropagation();
    this.dialogEntries.set(this.buildEntries()().map((entry) => ({ ...entry })));
    this.dialogVisible.set(true);
  }

  onSaved(entries: WarehouseStockEntry[]): void {
    this.saved.emit(entries);
  }
}
