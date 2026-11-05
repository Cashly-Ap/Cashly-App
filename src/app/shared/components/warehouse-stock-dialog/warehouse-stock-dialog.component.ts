import { LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { LanguageService } from '@core/i18n/language.service';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogHeaderComponent } from '@shared/components/ui/dialog-header/dialog-header.component';
import { WarehouseStockEntry } from '@shared/components/warehouse-stock-dialog/warehouse-stock-entry.interface';

@Component({
  selector: 'app-warehouse-stock-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DialogHeaderComponent,
    TranslatePipe,
    LocalizedNumberPipe,
    DialogModule,
    ButtonModule,
    FormsModule,
    InputNumberModule,
  ],
  templateUrl: './warehouse-stock-dialog.component.html',
})
export class WarehouseStockDialogComponent {
  readonly locale = inject(LanguageService).locale;

  readonly visible = model<boolean>(false);
  readonly entries = input<WarehouseStockEntry[]>([]);
  readonly productLabel = input<string | null>(null);
  readonly titleKey = input('catalog.products.stockByWarehouse');
  readonly subtitleKey = input('procurement.purchases.selectTheQuantityPerWarehouse');
  readonly emptyMessageKey = input('procurement.purchases.noWarehousesAvailableForThisProduct');
  readonly showStockDetails = input<boolean>(true);
  readonly unlimited = input<boolean>(false);

  readonly saved = output<WarehouseStockEntry[]>();

  readonly draft = linkedSignal(() =>
    this.entries().map((entry) => ({ ...entry, allocated: entry.allocated ?? 0 })),
  );

  readonly total = computed(() =>
    this.draft().reduce((sum, entry) => sum + (entry.allocated ?? 0), 0),
  );

  readonly hasEntries = computed(() => this.draft().length > 0);

  updateAllocation(index: number, value: number): void {
    this.draft.update((entries) =>
      entries.map((entry, current) => {
        if (current !== index) return entry;
        const max = this.unlimited() ? Number.POSITIVE_INFINITY : entry.available;
        const allocated = Math.max(0, Math.min(value ?? 0, max));
        return { ...entry, allocated };
      }),
    );
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter') return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('button')) return;
    event.preventDefault();
    this.save();
  }

  save(): void {
    if (!this.hasEntries()) {
      this.close();
      return;
    }
    this.saved.emit(
      this.draft().map((entry) => {
        const max = this.unlimited() ? Number.POSITIVE_INFINITY : entry.available;
        return { ...entry, allocated: Math.max(0, Math.min(entry.allocated ?? 0, max)) };
      }),
    );
    this.close();
  }

  close(): void {
    this.visible.set(false);
  }
}
