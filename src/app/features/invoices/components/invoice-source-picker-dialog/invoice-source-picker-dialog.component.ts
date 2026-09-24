import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { catchError, forkJoin, map, of, type Observable } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DecimalPipe } from '@angular/common';
import { OrderApiService } from '@features/orders/services/api/order-api.service';
import { QuoteApiService } from '@features/quotes/services/api/quote-api.service';
import { OrderDetails } from '@features/orders/models/interfaces/order-details.interface';
import { QuoteDetails } from '@features/quotes/models/interfaces/quote-details.interface';
import { OrderItemFormData } from '@features/orders/models/interfaces';
import { getOrderStatusLabel } from '@features/orders/models/enums/order-status.enum';
import { getQuoteStatusLabel } from '@features/quotes/models/enums/quote-status.enum';

export interface InvoiceSourceSelection {
  orderIds: string[];
  quoteIds: string[];
  items: OrderItemFormData[];
}

interface SourceRow {
  key: string;
  type: 'ORDER' | 'QUOTE';
  id: string;
  number: string;
  status: string;
  statusLabel: string;
  total: number;
}

interface SourceLinePreview {
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  required: number;
  available: number;
  warehouses: { name: string; available: number; reserved: number }[];
}

type StockState = 'CHECKING' | 'AVAILABLE' | 'INSUFFICIENT' | 'UNAVAILABLE';

interface SourceStockStatus {
  state: StockState;
  required: number;
  available: number;
}

@Component({
  selector: 'app-invoice-source-picker-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule, DecimalPipe],
  templateUrl: './invoice-source-picker-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceSourcePickerDialogComponent {
  private readonly orderApi = inject(OrderApiService);
  private readonly quoteApi = inject(QuoteApiService);

  readonly visible = input(false);
  readonly customerId = input<string | null>(null);
  readonly loadedOrderIds = input<string[]>([]);
  readonly loadedQuoteIds = input<string[]>([]);
  readonly sourceSelected = output<InvoiceSourceSelection>();
  readonly cancelled = output<void>();

  readonly rows = signal<SourceRow[]>([]);
  readonly selectedKeys = signal<string[]>([]);
  readonly expandedKeys = signal<string[]>([]);
  readonly previews = signal<Record<string, SourceLinePreview[]>>({});
  readonly details = signal<Record<string, OrderDetails | QuoteDetails>>({});
  readonly stockStatuses = signal<Record<string, SourceStockStatus>>({});
  readonly loading = signal(false);

  onShow(): void {
    const customerId = this.customerId();
    if (!customerId) return;
    this.loading.set(true);
    this.selectedKeys.set([]);
    this.expandedKeys.set([]);
    this.previews.set({});
    this.details.set({});
    this.stockStatuses.set({});
    forkJoin({
      draftOrders: this.orderApi.getAll({ customerId, status: 'DRAFT' }),
      confirmedOrders: this.orderApi.getAll({ customerId, status: 'CONFIRMED' }),
      draftQuotes: this.quoteApi.getAll({ customerId, status: 'DRAFT' }),
      customerDraftQuotes: this.quoteApi.getAll({ customerId, status: 'CUSTOMER_DRAFT' }),
    })
      .pipe(
        map(({ draftOrders, confirmedOrders, draftQuotes, customerDraftQuotes }) => [
          ...[...draftOrders, ...confirmedOrders].map((item) => ({
            key: `ORDER:${item.id}`,
            type: 'ORDER' as const,
            id: item.id,
            number: item.orderNumber,
            status: item.status,
            statusLabel: getOrderStatusLabel(item.status),
            total: item.totalAmount,
          })),
          ...[...draftQuotes, ...customerDraftQuotes].map((item) => ({
            key: `QUOTE:${item.id}`,
            type: 'QUOTE' as const,
            id: item.id,
            number: item.quoteNumber,
            status: item.status,
            statusLabel: getQuoteStatusLabel(item.status),
            total: item.subtotal,
          })),
        ]),
      )
      .subscribe({
        next: (rows) => this.loadStockStatuses(rows),
        error: () => {
          this.rows.set([]);
          this.loading.set(false);
        },
      });
  }

  toggle(row: SourceRow): void {
    if (this.isBlocked(row)) return;
    this.selectedKeys.update((keys) =>
      keys.includes(row.key) ? keys.filter((key) => key !== row.key) : [...keys, row.key],
    );
  }

  isSelected(row: SourceRow): boolean {
    return this.selectedKeys().includes(row.key);
  }

  isLoaded(row: SourceRow): boolean {
    return row.type === 'ORDER'
      ? this.loadedOrderIds().includes(row.id)
      : this.loadedQuoteIds().includes(row.id);
  }

  isBlocked(row: SourceRow): boolean {
    return this.isLoaded(row) || this.stockStatuses()[row.key]?.state !== 'AVAILABLE';
  }

  isStockAvailable(row: SourceRow): boolean {
    return this.stockStatuses()[row.key]?.state === 'AVAILABLE';
  }

  stockStatusLabel(row: SourceRow): string {
    if (this.isLoaded(row)) return 'Ya cargado en esta factura';
    const status = this.stockStatuses()[row.key];
    if (!status || status.state === 'CHECKING') return 'Comprobando stock...';
    if (status.state === 'AVAILABLE') {
      return `Stock disponible: ${status.available} de ${status.required}`;
    }
    if (status.state === 'UNAVAILABLE') return 'Sin stock registrado';
    return `Stock insuficiente: ${status.available} de ${status.required}`;
  }

  formatWarehouseStock(line: SourceLinePreview): string {
    return line.warehouses.map((warehouse) => `${warehouse.name}: ${warehouse.available}`).join(' | ');
  }

  isExpanded(row: SourceRow): boolean {
    return this.expandedKeys().includes(row.key);
  }

  togglePreview(row: SourceRow): void {
    if (this.isExpanded(row)) {
      this.expandedKeys.update((keys) => keys.filter((key) => key !== row.key));
      return;
    }
    this.expandedKeys.update((keys) => [...keys, row.key]);
    const cached = this.details()[row.key];
    if (cached) {
      this.setPreview(row, cached);
      return;
    }
    this.fetchDetail(row).subscribe({
      next: (detail) => this.setPreview(row, detail),
      error: () => this.closePreview(row),
    });
  }

  confirm(): void {
    const selected = this.rows().filter(
      (row) => this.selectedKeys().includes(row.key) && !this.isBlocked(row),
    );
    if (selected.length === 0) return;
    this.loading.set(true);
    forkJoin(selected.map((row) => this.details()[row.key] ? of(this.details()[row.key]) : this.fetchDetail(row))).subscribe({
      next: (details) => {
        const orderIds = selected.filter((row) => row.type === 'ORDER').map((row) => row.id);
        const quoteIds = selected.filter((row) => row.type === 'QUOTE').map((row) => row.id);
        this.sourceSelected.emit({
          orderIds,
          quoteIds,
          items: details.flatMap((detail) =>
            this.toItems(detail as OrderDetails | QuoteDetails),
          ),
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }

  private toItems(detail: OrderDetails | QuoteDetails): OrderItemFormData[] {
    const isQuote = 'lines' in detail;
    const lines: any[] = isQuote ? detail.lines : detail.items;
    return lines.map((line) => {
      const allocations: any[] = 'warehouseAllocations' in line ? line.warehouseAllocations : line.allocations;
      const stocks: any[] = line.warehouseStocks ?? [];
      const stockByWarehouse = new Map(stocks.map((stock) => [stock.warehouseId, stock]));
      const usableAllocations = allocations.filter((allocation) => {
        if (!isQuote || stocks.length === 0) return true;
        const stock = stockByWarehouse.get(allocation.warehouseId);
        return stock && stock.available >= (allocation.allocated ?? allocation.allocatedQuantity);
      });
      return {
        productId: line.productId,
        productCode: line.productCode,
        productName: line.productName,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        stock: stocks.map((stock) => ({
          warehouseId: stock.warehouseId,
          warehouseCode: 'warehouseCode' in stock ? stock.warehouseCode : '',
          warehouseName: stock.warehouseName,
          quantity: 'quantity' in stock ? stock.quantity : stock.available,
          reserved: 'reserved' in stock ? stock.reserved : 0,
          available: stock.available,
        })),
        warehouseAllocations: usableAllocations.map((allocation) => ({
          warehouseId: allocation.warehouseId,
          warehouseCode: 'warehouseCode' in allocation ? allocation.warehouseCode : '',
          warehouseName: allocation.warehouseName,
          available: 'available' in allocation ? allocation.available : 0,
          allocated: 'allocated' in allocation ? allocation.allocated : allocation.allocatedQuantity,
        })),
      };
    });
  }

  private toPreviewLines(detail: OrderDetails | QuoteDetails): SourceLinePreview[] {
    const lines: any[] = 'items' in detail ? detail.items : detail.lines;
    return lines.map((line) => {
      const stocks: any[] = line.warehouseStocks ?? [];
      return {
        productName: line.productName,
        productCode: line.productCode,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        subtotal: 'subtotal' in line ? line.subtotal : line.subtotal ?? line.lineTotal,
        required: Number(line.quantity),
        available: stocks.reduce((sum, stock) => sum + Number(stock.available ?? 0), 0),
        warehouses: stocks.map((stock) => ({
          name: stock.warehouseName,
          available: Number(stock.available ?? 0),
          reserved: Number(stock.reserved ?? 0),
        })),
      };
    });
  }

  private setPreview(row: SourceRow, detail: OrderDetails | QuoteDetails): void {
    this.details.update((current) => ({ ...current, [row.key]: detail }));
    this.previews.update((current) => ({
      ...current,
      [row.key]: this.toPreviewLines(detail),
    }));
  }

  private closePreview(row: SourceRow): void {
    this.expandedKeys.update((keys) => keys.filter((key) => key !== row.key));
  }

  private loadStockStatuses(rows: SourceRow[]): void {
    this.rows.set(rows);
    if (rows.length === 0) {
      this.loading.set(false);
      return;
    }
    forkJoin(rows.map((row) => this.fetchDetail(row).pipe(
      map((detail) => ({ row, detail })),
      catchError(() => of({ row, detail: null })),
    ))).subscribe((results) => {
      const statuses: Record<string, SourceStockStatus> = {};
      const loadedDetails: Record<string, OrderDetails | QuoteDetails> = {};
      for (const result of results) {
        if (!result.detail) {
          statuses[result.row.key] = { state: 'UNAVAILABLE', required: 0, available: 0 };
          continue;
        }
        loadedDetails[result.row.key] = result.detail;
        const lines: any[] = 'items' in result.detail ? result.detail.items : result.detail.lines;
        const required = lines.reduce((sum, line) => sum + Number(line.quantity), 0);
        const available = lines.reduce(
          (sum, line) => sum + (line.warehouseStocks ?? []).reduce((lineSum: number, stock: any) => lineSum + Number(stock.available ?? 0), 0),
          0,
        );
        const everyLineHasStock = lines.every((line) => {
          const lineRequired = Number(line.quantity);
          const lineAvailable = (line.warehouseStocks ?? []).reduce(
            (lineSum: number, stock: any) => lineSum + Number(stock.available ?? 0),
            0,
          );
          return lineAvailable >= lineRequired;
        });
        statuses[result.row.key] = {
          state: everyLineHasStock ? 'AVAILABLE' : available > 0 ? 'INSUFFICIENT' : 'UNAVAILABLE',
          required,
          available,
        };
      }
      this.details.set(loadedDetails);
      this.stockStatuses.set(statuses);
      this.loading.set(false);
    });
  }

  private fetchDetail(row: SourceRow): Observable<OrderDetails | QuoteDetails> {
    return (row.type === 'ORDER'
      ? this.orderApi.getById(row.id)
      : this.quoteApi.getById(row.id)) as Observable<OrderDetails | QuoteDetails>;
  }
}
