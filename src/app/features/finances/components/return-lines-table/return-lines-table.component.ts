import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { InvoiceLineDetail } from '@features/invoices/models/interfaces';

interface ReturnLineFormData {
  invoiceLineId: string;
  productId: string;
  productName: string;
  quantity: number;
  warehouseId: string;
  unitPrice: number;
}

@Component({
  selector: 'app-return-lines-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, InputNumberModule, SelectModule],
  templateUrl: './return-lines-table.component.html',
})
export class ReturnLinesTableComponent {
  readonly invoiceLines = input.required<InvoiceLineDetail[]>();
  readonly returnLines = input.required<ReturnLineFormData[]>();
  readonly returnLinesChange = output<ReturnLineFormData[]>();

  readonly warehouseOptions = computed(() => {
    const warehouses = new Map<string, { id: string; code: string; name: string }>();
    for (const line of this.invoiceLines()) {
      for (const stock of line.warehouseStocks ?? []) {
        if (!warehouses.has(stock.warehouseId)) {
          warehouses.set(stock.warehouseId, {
            id: stock.warehouseId,
            code: stock.warehouseCode,
            name: stock.warehouseName,
          });
        }
      }
    }
    return Array.from(warehouses.values()).map((w) => ({
      label: `${w.name} (${w.code})`,
      value: w.id,
    }));
  });

  readonly totalAmount = computed(() =>
    this.returnLines().reduce((sum, l) => sum + l.quantity * l.unitPrice, 0),
  );

  onQuantityChange(lineIndex: number, value: number): void {
    const lines = [...this.returnLines()];
    const originalLine = this.invoiceLines()[lineIndex];
    if (value > originalLine.quantity) {
      value = originalLine.quantity;
    }
    if (value < 0) {
      value = 0;
    }
    lines[lineIndex] = { ...lines[lineIndex], quantity: value };
    this.returnLinesChange.emit(lines);
  }

  onWarehouseChange(lineIndex: number, warehouseId: string): void {
    const lines = [...this.returnLines()];
    lines[lineIndex] = { ...lines[lineIndex], warehouseId };
    this.returnLinesChange.emit(lines);
  }

  getAvailableStock(lineIndex: number, warehouseId: string): number {
    const line = this.invoiceLines()[lineIndex];
    const stock = (line.warehouseStocks ?? []).find((s: { warehouseId: string }) => s.warehouseId === warehouseId);
    return stock?.available ?? 0;
  }

  getMaxQuantity(lineIndex: number): number {
    return this.invoiceLines()[lineIndex].quantity;
  }
}
