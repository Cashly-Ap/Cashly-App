import { LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  computed,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InvoiceLineDetail } from '@features/finance/billing/invoices/models/interfaces/invoice-details.interface';
import { WarehouseStockEntry } from '@shared/components/warehouse-stock-dialog/warehouse-stock-entry.interface';
import { WarehouseApiService } from '@features/inventory/warehouses/services/api/warehouse-api.service';
import { StockAllocationButtonComponent } from '@shared/components/stock-allocation-button/stock-allocation-button.component';

export interface WarehouseAlloc {
  warehouseId: string;
  allocated: number;
}

export interface ReturnLineFormData {
  invoiceLineId: string;
  productId: string;
  productName: string;
  quantity: number;
  warehouseId: string;
  unitPrice: number;
  warehouseAllocations: WarehouseAlloc[];
}

@Component({
  selector: 'app-return-lines-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    LocalizedNumberPipe,
    CommonModule,
    ButtonModule,
    TooltipModule,
    StockAllocationButtonComponent,
  ],
  templateUrl: './return-lines-table.component.html',
})
export class ReturnLinesTableComponent implements OnInit {
  private readonly warehouseApi = inject(WarehouseApiService);

  readonly allWarehouses = signal<{ id: string; code: string; name: string }[]>([]);

  ngOnInit(): void {
    this.warehouseApi.getAllSimple().subscribe({
      next: (whs) => this.allWarehouses.set(whs.map((w) => ({ id: w.id, code: '', name: w.name }))),
    });
  }

  readonly invoiceLines = input.required<InvoiceLineDetail[]>();
  readonly returnLines = input.required<ReturnLineFormData[]>();
  readonly returnLinesChange = output<ReturnLineFormData[]>();

  readonly totalAmount = computed(() =>
    this.returnLines().reduce((sum, l) => sum + l.quantity * l.unitPrice, 0),
  );

  allocationEntriesFor(itemIdx: number): () => WarehouseStockEntry[] {
    return () => {
      const line = this.invoiceLines()[itemIdx];
      if (!line) return [];

      const maxQty = Math.max(0, line.quantity - line.returnedQuantity);
      const existingLine = this.returnLines()[itemIdx];
      const existingAllocs = existingLine?.warehouseAllocations ?? [];
      const allocMap = new Map(existingAllocs.map((a) => [a.warehouseId, a.allocated]));
      const totalExisting = existingAllocs.reduce(
        (sum, allocation) => sum + allocation.allocated,
        0,
      );

      return this.allWarehouses().map((warehouse) => {
        const allocated = allocMap.get(warehouse.id) ?? 0;
        return {
          warehouseId: warehouse.id,
          warehouseCode: warehouse.code,
          warehouseName: warehouse.name,
          quantity: maxQty,
          reserved: 0,
          available: Math.max(0, maxQty - totalExisting + allocated),
          allocated,
        };
      });
    };
  }

  getMaxQuantity(lineIndex: number): number {
    const line = this.invoiceLines()[lineIndex];
    if (!line) return 0;
    return Math.max(0, line.quantity - line.returnedQuantity);
  }

  onAllocationSaved(itemIdx: number, entries: WarehouseStockEntry[]): void {
    const maxQty = this.getMaxQuantity(itemIdx);
    const allocations: WarehouseAlloc[] = [];
    let remaining = maxQty;

    for (const entry of entries) {
      if (remaining <= 0) break;
      const allocated = Math.min(Math.max(0, entry.allocated ?? 0), remaining);
      if (allocated <= 0) continue;
      allocations.push({ warehouseId: entry.warehouseId, allocated });
      remaining -= allocated;
    }

    const finalQty = maxQty - remaining;
    const firstAllocation = allocations[0];
    const lines = [...this.returnLines()];
    lines[itemIdx] = {
      ...lines[itemIdx],
      quantity: finalQty,
      warehouseId: firstAllocation?.warehouseId ?? '',
      warehouseAllocations: allocations,
    };

    this.returnLinesChange.emit(lines);
  }
}
