import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { QuoteApiService } from '@features/sales/quotes/services/api/quote-api.service';
import { QuoteDetails } from '@features/sales/quotes/models/interfaces/quote-details.interface';

interface AllocationWithStock {
  warehouseName: string;
  warehouseCode: string;
  allocated: number;
  available: number;
  availableAfterReserve: number;
  wouldBeNegative: boolean;
}

interface LineWithStockInfo {
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  allocations: AllocationWithStock[];
  hasNegativeStock: boolean;
}

@Component({
  selector: 'app-convert-to-order-dialog',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DialogModule, ButtonModule, TableModule, TooltipModule],
  templateUrl: './convert-to-order-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConvertToOrderDialogComponent implements OnChanges {
  private readonly api = inject(QuoteApiService);

  readonly visible = input<boolean>(false);
  readonly quoteId = input<string | null>(null);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly lines = signal<LineWithStockInfo[]>([]);
  readonly quoteInfo = signal<{ number: string; customerName: string; subtotal: number } | null>(
    null,
  );
  readonly hasAnyNegativeStock = signal(false);

  ngOnChanges(): void {
    if (this.visible() && this.quoteId()) {
      this.loadQuoteData();
    }
    if (!this.visible()) {
      this.lines.set([]);
      this.quoteInfo.set(null);
      this.error.set(null);
      this.hasAnyNegativeStock.set(false);
    }
  }

  private loadQuoteData(): void {
    const id = this.quoteId();
    if (!id) return;

    this.loading.set(true);
    this.error.set(null);

    this.api.getById(id).subscribe({
      next: (quote) => {
        this.quoteInfo.set({
          number: quote.quoteNumber,
          customerName: quote.customerName,
          subtotal: quote.subtotal,
        });

        const mappedLines = quote.lines.map((line) => this.mapLineWithStock(line, quote));

        this.lines.set(mappedLines);
        this.hasAnyNegativeStock.set(mappedLines.some((l) => l.hasNegativeStock));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.error?.message || err?.message || 'Error al cargar datos del presupuesto',
        );
        this.loading.set(false);
      },
    });
  }

  private mapLineWithStock(line: QuoteDetails['lines'][0], quote: QuoteDetails): LineWithStockInfo {
    const allocations: AllocationWithStock[] = line.allocations.map((wa) => {
      const stockInfo = line.warehouseStocks?.find((ws) => ws.warehouseId === wa.warehouseId);

      const available = stockInfo?.available ?? 0;
      const availableAfterReserve = available - wa.allocatedQuantity;
      const wouldBeNegative = availableAfterReserve < 0;

      return {
        warehouseName: wa.warehouseName,
        warehouseCode: wa.warehouseCode ?? '',
        allocated: wa.allocatedQuantity,
        available,
        availableAfterReserve,
        wouldBeNegative,
      };
    });

    return {
      productName: line.productName,
      productCode: line.productCode,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      subtotal: line.subtotal,
      allocations,
      hasNegativeStock: allocations.some((a) => a.wouldBeNegative),
    };
  }

  onConfirm(): void {
    if (this.hasAnyNegativeStock()) return;
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
