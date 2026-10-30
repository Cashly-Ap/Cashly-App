import { reviewDocumentStock } from '@shared/utils/document-stock';
import { LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { ShortcutDirective } from '@core/shortcuts/shortcut.directive';
import { PermissionDirective } from '@features/platform/auth/authorization/directives/permission.directive';
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
  imports: [
    TranslatePipe,
    LocalizedNumberPipe,
    ShortcutDirective,
    PermissionDirective,
    CommonModule,
    DecimalPipe,
    DialogModule,
    ButtonModule,
    TableModule,
    TooltipModule,
  ],
  templateUrl: './convert-to-order-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConvertToOrderDialogComponent implements OnChanges {
  private readonly api = inject(QuoteApiService);
  private requestVersion = 0;

  readonly visible = input<boolean>(false);
  readonly quoteId = input<string | null>(null);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  readonly loading = signal(false);
  readonly confirming = signal(false);
  readonly error = signal<string | null>(null);
  readonly lines = signal<LineWithStockInfo[]>([]);
  readonly quoteInfo = signal<{ number: string; customerName: string; subtotal: number } | null>(
    null,
  );
  readonly hasAnyNegativeStock = signal(false);

  ngOnChanges(): void {
    ++this.requestVersion;
    if (this.visible() && this.quoteId()) {
      this.loadQuoteData();
    }
    if (!this.visible()) {
      this.confirming.set(false);
      this.lines.set([]);
      this.quoteInfo.set(null);
      this.error.set(null);
      this.hasAnyNegativeStock.set(false);
    }
  }

  private loadQuoteData(): void {
    const id = this.quoteId();
    if (!id) return;

    const version = this.requestVersion;
    this.quoteInfo.set(null);
    this.lines.set([]);
    this.hasAnyNegativeStock.set(true);
    this.loading.set(true);
    this.error.set(null);

    this.api.getById(id).subscribe({
      next: (quote) => {
        if (version !== this.requestVersion) return;
        this.quoteInfo.set({
          number: quote.quoteNumber,
          customerName: quote.customerName,
          subtotal: quote.subtotal,
        });

        const mappedLines = quote.lines.map((line) => this.mapLineWithStock(line, quote));

        this.lines.set(mappedLines);
        this.hasAnyNegativeStock.set(
          !reviewDocumentStock(
            quote.lines.map((line) => ({
              productId: line.productId,
              productName: line.productName,
              quantity: line.quantity,
              allocations: line.allocations.map((allocation) => ({
                warehouseId: allocation.warehouseId,
                warehouseName: allocation.warehouseName,
                quantity: allocation.allocatedQuantity,
                available:
                  line.warehouseStocks?.find(
                    (stock) => stock.warehouseId === allocation.warehouseId,
                  )?.available ?? 0,
              })),
            })),
          ).valid,
        );
        this.loading.set(false);
      },
      error: (err) => {
        if (version !== this.requestVersion) return;
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
    if (
      !this.visible() ||
      this.loading() ||
      this.error() ||
      !this.quoteInfo() ||
      this.hasAnyNegativeStock() ||
      this.confirming()
    )
      return;
    this.confirming.set(true);
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
