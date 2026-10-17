import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  input,
  output,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { InvoiceApiService } from '@features/finance/billing/invoices/services/api/invoice-api.service';
import {
  InvoiceDetails,
  InvoiceLineDetail,
} from '@features/finance/billing/invoices/models/interfaces/invoice-details.interface';
import { CustomerList } from '@features/customers/models/interfaces/customer-list.interface';
import { CustomerPickerDialogComponent } from '@features/sales/orders/components/customer-picker-dialog/customer-picker-dialog.component';

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

export interface DuplicateConfirmEvent {
  invoiceId: string;
  customerId?: string;
}

@Component({
  selector: 'app-duplicate-invoice-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    TableModule,
    TooltipModule,
    CustomerPickerDialogComponent,
  ],
  templateUrl: './duplicate-invoice-dialog.component.html',
})
export class DuplicateInvoiceDialogComponent implements OnChanges {
  private readonly api = inject(InvoiceApiService);

  readonly visible = input<boolean>(false);
  readonly invoiceId = input<string | null>(null);

  readonly confirmed = output<DuplicateConfirmEvent>();
  readonly cancelled = output<void>();

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly lines = signal<LineWithStockInfo[]>([]);
  readonly invoiceInfo = signal<{
    number: string;
    customerName: string;
    customerRif: string | null;
  } | null>(null);
  readonly hasAnyNegativeStock = signal(false);
  readonly selectedCustomer = signal<CustomerList | null>(null);
  readonly showCustomerPicker = signal(false);

  ngOnChanges(): void {
    if (this.visible() && this.invoiceId()) {
      this.loadInvoiceData();
    }
    if (!this.visible()) {
      this.lines.set([]);
      this.invoiceInfo.set(null);
      this.error.set(null);
      this.hasAnyNegativeStock.set(false);
      this.selectedCustomer.set(null);
      this.showCustomerPicker.set(false);
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
          customerRif: invoice.customerRif,
        });

        const mappedLines = invoice.lines.map((line) => this.mapLineWithStock(line));

        this.lines.set(mappedLines);
        this.hasAnyNegativeStock.set(mappedLines.some((l) => l.hasNegativeStock));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.error?.message || err?.message || 'Error al cargar datos de la factura',
        );
        this.loading.set(false);
      },
    });
  }

  private mapLineWithStock(line: InvoiceLineDetail): LineWithStockInfo {
    const allocations: AllocationWithStock[] = line.warehouseAllocations.map((wa) => {
      const stockInfo = line.warehouseStocks?.find((ws) => ws.warehouseId === wa.warehouseId);

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

  onCustomerSelected(customer: CustomerList): void {
    this.selectedCustomer.set(customer);
    this.showCustomerPicker.set(false);
  }

  onCustomerPickerCancelled(): void {
    this.showCustomerPicker.set(false);
  }

  onClearCustomer(): void {
    this.selectedCustomer.set(null);
  }

  onConfirm(): void {
    const id = this.invoiceId();
    if (!id || this.hasAnyNegativeStock()) return;

    this.confirmed.emit({
      invoiceId: id,
      customerId: this.selectedCustomer()?.id,
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
