import { ChangeDetectionStrategy, Component, OnChanges, inject, input, output, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { PaymentType, PAYMENT_TYPE_LABELS } from '@features/invoices/models/enums/payment-type.enum';
import { QuoteApiService } from '@features/quotes/services/api/quote-api.service';
import { QuoteDetails } from '@features/quotes/models/interfaces';

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
  selector: 'app-convert-to-invoice-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, SelectModule, FormsModule, DecimalPipe, TableModule, TooltipModule],
  templateUrl: './convert-to-invoice-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConvertToInvoiceDialogComponent implements OnChanges {
  private readonly api = inject(QuoteApiService);

  readonly visible = input<boolean>(false);
  readonly quoteId = input<string | null>(null);

  readonly paymentType = signal<PaymentType>(PaymentType.CASH);
  readonly paymentTypeOptions = Object.values(PaymentType).map((pt) => ({
    label: PAYMENT_TYPE_LABELS[pt],
    value: pt,
  }));

  readonly confirmed = output<{ paymentType: string }>();
  readonly cancelled = output<void>();

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly lines = signal<LineWithStockInfo[]>([]);
  readonly quoteInfo = signal<{ number: string; customerName: string; subtotal: number } | null>(null);
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
      this.paymentType.set(PaymentType.CASH);
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
        this.error.set(err?.error?.message || err?.message || 'Error al cargar datos del presupuesto');
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
    this.confirmed.emit({ paymentType: this.paymentType() });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
