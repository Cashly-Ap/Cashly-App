import { LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { LanguageService } from '@core/i18n/language.service';
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
import { InputNumberModule } from 'primeng/inputnumber';
import { WarehouseStockDialogComponent } from '@shared/components/warehouse-stock-dialog/warehouse-stock-dialog.component';
import { WarehouseStockEntry } from '@shared/components/warehouse-stock-dialog/warehouse-stock-entry.interface';
import { SingleWarehouseContext } from '@features/inventory/warehouses/models/interfaces/single-warehouse.interface';

@Component({
  selector: 'app-stock-allocation-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    LocalizedNumberPipe,
    FormsModule,
    InputNumberModule,
    WarehouseStockDialogComponent,
  ],
  templateUrl: './stock-allocation-button.component.html',
})
export class StockAllocationButtonComponent {
  readonly locale = inject(LanguageService).locale;

  readonly buildEntries = input.required<() => WarehouseStockEntry[]>();
  readonly productLabel = input<string | null>(null);
  readonly showStockDetails = input<boolean>(true);
  readonly unlimited = input<boolean>(false);
  readonly emptyMessageKey = input('procurement.purchases.noWarehousesAvailableForThisProduct');
  readonly singleWarehouse = input<SingleWarehouseContext | null>(null);

  readonly saved = output<WarehouseStockEntry[]>();

  readonly dialogVisible = signal<boolean>(false);
  readonly dialogEntries = signal<WarehouseStockEntry[]>([]);

  readonly singleEntry = computed<WarehouseStockEntry | null>(() => {
    const warehouse = this.singleWarehouse();
    if (!warehouse) return null;

    const entry = this.buildEntries()().find((item) => item.warehouseId === warehouse.id);
    return (
      entry ?? {
        warehouseId: warehouse.id,
        warehouseCode: warehouse.code,
        warehouseName: warehouse.name,
        quantity: 0,
        reserved: 0,
        available: 0,
        allocated: 0,
      }
    );
  });

  readonly singleAllocated = computed(() => this.singleEntry()?.allocated ?? 0);

  readonly singleMax = computed(() => {
    if (this.unlimited()) return 999999;
    return this.singleEntry()?.available ?? 0;
  });

  open(event: MouseEvent): void {
    event.stopPropagation();
    this.dialogEntries.set(this.buildEntries()().map((entry) => ({ ...entry })));
    this.dialogVisible.set(true);
  }

  onSaved(entries: WarehouseStockEntry[]): void {
    this.saved.emit(entries);
  }

  onInlineChange(value: number | null): void {
    const entry = this.singleEntry();
    if (!entry) return;

    const allocated = Math.max(0, Math.min(value ?? 0, this.singleMax()));
    this.saved.emit([{ ...entry, allocated }]);
  }
}
