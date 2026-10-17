import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  inject,
  input,
  output,
  computed,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Popover, PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InvoiceLineDetail } from '@features/finance/billing/invoices/models/interfaces/invoice-details.interface';
import { WarehouseStockPopoverComponent } from '@features/orders/components/warehouse-stock-popover/warehouse-stock-popover.component';
import { WarehouseStockEntry } from '@features/orders/components/warehouse-stock-popover/warehouse-stock-entry.interface';
import { WarehouseApiService } from '@features/inventory/warehouses/services/api/warehouse-api.service';

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
    CommonModule,
    DecimalPipe,
    PopoverModule,
    ButtonModule,
    TooltipModule,
    WarehouseStockPopoverComponent,
  ],
  templateUrl: './return-lines-table.component.html',
})
export class ReturnLinesTableComponent implements OnInit {
  private readonly warehouseApi = inject(WarehouseApiService);

  @ViewChild('allocationPopover') private readonly allocationPopover!: Popover;

  readonly allWarehouses = signal<{ id: string; code: string; name: string }[]>([]);

  ngOnInit(): void {
    this.warehouseApi.getAllSimple().subscribe({
      next: (whs) => this.allWarehouses.set(whs.map((w) => ({ id: w.id, code: '', name: w.name }))),
    });
  }

  readonly invoiceLines = input.required<InvoiceLineDetail[]>();
  readonly returnLines = input.required<ReturnLineFormData[]>();
  readonly returnLinesChange = output<ReturnLineFormData[]>();

  readonly activeItemIdx = signal<number | null>(null);
  readonly popoverAllocations = signal<WarehouseStockEntry[]>([]);

  readonly totalAmount = computed(() =>
    this.returnLines().reduce((sum, l) => sum + l.quantity * l.unitPrice, 0),
  );

  readonly allocationTotal = computed(() =>
    this.popoverAllocations().reduce((sum, a) => sum + (a.allocated ?? 0), 0),
  );

  openAllocationPopover(event: MouseEvent, itemIdx: number): void {
    event.stopPropagation();
    if (this.activeItemIdx() === itemIdx) {
      this.allocationPopover.hide();
      this.activeItemIdx.set(null);
      return;
    }
    const line = this.invoiceLines()[itemIdx];
    if (!line) return;
    const maxQty = Math.max(0, line.quantity - line.returnedQuantity);
    const existingLine = this.returnLines()[itemIdx];
    const existingAllocs = existingLine?.warehouseAllocations ?? [];

    const allocMap = new Map(existingAllocs.map((a) => [a.warehouseId, a.allocated]));
    const totalExisting = existingAllocs.reduce((s, a) => s + a.allocated, 0);
    const remainingExisting = Math.max(0, maxQty - totalExisting);

    const allocations: WarehouseStockEntry[] = this.allWarehouses().map((w) => {
      const allocated = allocMap.get(w.id) ?? 0;
      return {
        warehouseId: w.id,
        warehouseCode: w.code,
        warehouseName: w.name,
        quantity: maxQty,
        reserved: 0,
        available: this.getAllocationRemaining(maxQty, allocated, totalExisting),
        allocated,
      };
    });
    this.activeItemIdx.set(itemIdx);
    this.popoverAllocations.set(allocations);
    this.allocationPopover.show(event);
  }

  private getAllocationRemaining(maxQty: number, allocated: number, totalExisting: number): number {
    return Math.max(0, maxQty - totalExisting + allocated);
  }

  updatePopoverAllocation(index: number, value: number): void {
    const current = this.popoverAllocations();
    const line = this.invoiceLines()[this.activeItemIdx() ?? -1];
    const maxQty = line ? Math.max(0, line.quantity - line.returnedQuantity) : 0;
    const othersTotal = current.reduce((s, a, i) => s + (i !== index ? (a.allocated ?? 0) : 0), 0);
    const maxForThis = Math.max(0, maxQty - othersTotal);
    const clampedValue = Math.min(value, maxForThis);
    const allocatedTotal = othersTotal + clampedValue;
    const remaining = Math.max(0, maxQty - allocatedTotal);

    const updated = current.map((a, i) => {
      if (i === index)
        return { ...a, allocated: clampedValue, available: clampedValue + remaining };
      const avail = (a.allocated ?? 0) + remaining;
      return { ...a, available: avail > 0 ? avail : 0 };
    });
    this.popoverAllocations.set(updated);
  }

  getMaxQuantity(lineIndex: number): number {
    const line = this.invoiceLines()[lineIndex];
    if (!line) return 0;
    return Math.max(0, line.quantity - line.returnedQuantity);
  }

  confirmAllocations(): void {
    const itemIdx = this.activeItemIdx();
    if (itemIdx === null) return;

    const popoverData = this.popoverAllocations();
    const totalAllocated = popoverData.reduce((s, a) => s + (a.allocated ?? 0), 0);
    const line = this.invoiceLines()[itemIdx];
    const maxQty = line ? Math.max(0, line.quantity - line.returnedQuantity) : 0;
    const finalQty = Math.min(totalAllocated, maxQty);
    const firstAlloc = popoverData.find((a) => (a.allocated ?? 0) > 0);

    const warehouseAllocations = popoverData
      .filter((a) => (a.allocated ?? 0) > 0)
      .map((a) => ({ warehouseId: a.warehouseId, allocated: a.allocated }));

    const lines = [...this.returnLines()];
    lines[itemIdx] = {
      ...lines[itemIdx],
      quantity: finalQty,
      warehouseId: firstAlloc?.warehouseId ?? '',
      warehouseAllocations,
    };

    this.returnLinesChange.emit(lines);
    this.allocationPopover.hide();
    this.activeItemIdx.set(null);
  }
}
