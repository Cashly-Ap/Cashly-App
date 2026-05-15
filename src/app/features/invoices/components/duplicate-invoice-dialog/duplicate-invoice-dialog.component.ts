import { ChangeDetectionStrategy, Component, OnChanges, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { InvoiceApiService } from '@features/invoices/services/api/invoice-api.service';
import { InvoiceDetails, InvoiceLineDetail } from '@features/invoices/models/interfaces';

interface AllocationWithStock {
  warehouseName: string;
  warehouseCode: string;
  allocated: number;
  realAvailable: number;
  availableAfterReserve: number;
  wouldBeNegative: boolean;
}

interface LineWithStockInfo {
  productName: string;
  productCode: string;
  quantity: number;
  allocations: AllocationWithStock[];
  hasNegativeStock: boolean;
}

@Component({
  selector: 'app-duplicate-invoice-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DialogModule, ButtonModule, TableModule, TooltipModule],
  templateUrl: './duplicate-invoice-dialog.component.html',
})
export class DuplicateInvoiceDialogComponent implements OnChanges {
  private readonly api = inject(InvoiceApiService);

  readonly visible = input<boolean>(false);
  readonly invoiceId = input<string | null>(null);

  readonly confirmed = output<string>();
  readonly cancelled = output<void>();

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly lines = signal<LineWithStockInfo[]>([]);
  readonly invoiceInfo = signal<{ number: string; customerName: string } | null>(null);
  readonly hasAnyNegativeStock = signal(false);

  ngOnChanges(): void {
    if (this.visible() && this.invoiceId()) {
      this.loadInvoiceData();
    }
    if (!this.visible()) {
      this.lines.set([]);
      this.invoiceInfo.set(null);
      this.error.set(null);
      this.hasAnyNegativeStock.set(false);
    }
  }

  private loadInvoiceData(): void {
    const id = this.invoiceId();
    if (!id) return;

    this.loading.set(true);
    this.error.set(null);

    this.api.getById(id).subscribe({
      next: (invoice) => {
        this.invoiceInfo.set({
          number: invoice.invoiceNumber,
          customerName: invoice.customerName,
        });

        const mappedLines = invoice.lines.map((line) =>
          this.mapLineWithStock(line)
        );

        this.lines.set(mappedLines);
        this.hasAnyNegativeStock.set(mappedLines.some((l) => l.hasNegativeStock));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || err?.message || 'Error al cargar datos de la factura');
        this.loading.set(false);
      },
    });
  }

  private mapLineWithStock(line: InvoiceLineDetail): LineWithStockInfo {
    const allocations: AllocationWithStock[] = line.warehouseAllocations.map((wa) => {
      const stockInfo = line.warehouseStocks?.find(
        (ws) => ws.warehouseId === wa.warehouseId
      );

      const inflatedAvailable = stockInfo?.available ?? 0;
      const realAvailable = inflatedAvailable - wa.allocated;
      const availableAfterReserve = realAvailable - wa.allocated;
      const wouldBeNegative = availableAfterReserve < 0;

      return {
        warehouseName: wa.warehouseName,
        warehouseCode: wa.warehouseCode,
        allocated: wa.allocated,
        realAvailable,
        availableAfterReserve,
        wouldBeNegative,
      };
    });

    return {
      productName: line.productName,
      productCode: line.productCode,
      quantity: line.quantity,
      allocations,
      hasNegativeStock: allocations.some((a) => a.wouldBeNegative),
    };
  }

  onConfirm(): void {
    const id = this.invoiceId();
    if (!id || this.hasAnyNegativeStock()) return;
    this.confirmed.emit(id);
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
