import { ChangeDetectionStrategy, Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { QuoteApiService, AssignQuoteWarehousesRequest } from '@features/quotes/services/api/quote-api.service';
import { QuoteDetails } from '@features/quotes/models/interfaces';

interface WarehouseAssignmentState {
  warehouseId: string;
  warehouseName: string;
  available: number;
  assigned: number;
}

interface LineAssignmentState {
  lineId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  warehouses: WarehouseAssignmentState[];
  totalAssigned: number;
  complete: boolean;
}

@Component({
  selector: 'app-assign-warehouses-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, DialogModule, ButtonModule, TableModule, InputNumberModule, TooltipModule],
  templateUrl: './assign-warehouses-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignWarehousesDialogComponent implements OnChanges {
  private readonly api = inject(QuoteApiService);

  readonly visible = input<boolean>(false);
  readonly quoteId = input<string | null>(null);

  readonly confirmed = output<AssignQuoteWarehousesRequest>();
  readonly cancelled = output<void>();

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly lines = signal<LineAssignmentState[]>([]);
  readonly quoteInfo = signal<{ number: string; customerName: string; subtotal: number } | null>(null);

  readonly canConfirm = computed(() => {
    const all = this.lines();
    return all.length > 0 && all.every((l) => l.complete);
  });

  ngOnChanges(): void {
    if (this.visible() && this.quoteId()) {
      this.loadQuoteData();
    }
    if (!this.visible()) {
      this.lines.set([]);
      this.quoteInfo.set(null);
      this.error.set(null);
    }
  }

  private loadQuoteData(): void {
    const id = this.quoteId();
    if (!id) return;

    this.loading.set(true);
    this.error.set(null);

    this.api.getById(id).subscribe({
      next: (quote) => {
        this.api.getWarehousesForQuote(quote.customerId).subscribe({
          next: (warehouses) => {
            this.quoteInfo.set({
              number: quote.quoteNumber,
              customerName: quote.customerName,
              subtotal: quote.subtotal,
            });
            this.lines.set(this.buildLines(quote, warehouses.map((w) => ({ id: w.id, name: w.name }))));
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set(err?.error?.message || err?.message || 'Error al cargar los almacenes del cliente');
            this.loading.set(false);
          },
        });
      },
      error: (err) => {
        this.error.set(err?.error?.message || err?.message || 'Error al cargar datos del presupuesto');
        this.loading.set(false);
      },
    });
  }

  private buildLines(
    quote: QuoteDetails,
    warehouses: { id: string; name: string }[],
  ): LineAssignmentState[] {
    return quote.lines.map((line) => {
      const warehousesState: WarehouseAssignmentState[] = warehouses.map((wh) => {
        const existing = line.allocations.find((a) => a.warehouseId === wh.id);
        const stock = line.warehouseStocks?.find((ws) => ws.warehouseId === wh.id);
        return {
          warehouseId: wh.id,
          warehouseName: wh.name,
          available: stock?.available ?? 0,
          assigned: existing?.allocatedQuantity ?? 0,
        };
      });

      const totalAssigned = warehousesState.reduce((sum, w) => sum + w.assigned, 0);

      return {
        lineId: line.id,
        productName: line.productName,
        productCode: line.productCode,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        subtotal: line.subtotal,
        warehouses: warehousesState,
        totalAssigned,
        complete: Math.abs(totalAssigned - line.quantity) < 0.0001,
      };
    });
  }

  onAssignedChange(line: LineAssignmentState): void {
    this.lines.update((current) =>
      current.map((l) => {
        if (l.lineId !== line.lineId) return l;
        const total = l.warehouses.reduce((sum, w) => sum + (w.assigned || 0), 0);
        return { ...l, totalAssigned: total, complete: Math.abs(total - l.quantity) < 0.0001 };
      }),
    );
  }

  onConfirm(): void {
    if (!this.canConfirm()) return;
    const request: AssignQuoteWarehousesRequest = {
      lines: this.lines().map((l) => ({
        lineId: l.lineId,
        allocations: l.warehouses
          .filter((w) => (w.assigned || 0) > 0)
          .map((w) => ({ warehouseId: w.warehouseId, allocatedQuantity: w.assigned || 0 })),
      })),
    };
    this.confirmed.emit(request);
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
