import { ChangeDetectionStrategy, Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { RadioButtonModule } from 'primeng/radiobutton';
import { OrderApiService, AssignOrderWarehousesRequest } from '@features/orders/services/api/order-api.service';
import { OrderDetails } from '@features/orders/models/interfaces';

type ConversionOption = 'none' | 'confirm' | 'invoice';

interface WarehouseState {
  warehouseId: string;
  warehouseName: string;
  available: number;
  assigned: number;
}

interface LineState {
  lineId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  warehouses: WarehouseState[];
  totalAssigned: number;
  complete: boolean;
}

@Component({
  selector: 'app-assign-warehouses-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, DialogModule, ButtonModule, TableModule, InputNumberModule, InputTextModule, TooltipModule, RadioButtonModule],
  templateUrl: './assign-warehouses-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignWarehousesDialogComponent implements OnChanges {
  private readonly api = inject(OrderApiService);

  readonly visible = input<boolean>(false);
  readonly orderId = input<string | null>(null);

  readonly confirmed = output<string>();
  readonly convertToInvoice = output<{ orderId: string; paymentType: string; confirmationPassword?: string }>();
  readonly finished = output<void>();
  readonly cancelled = output<void>();

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly lines = signal<LineState[]>([]);
  readonly orderInfo = signal<{ number: string; customerName: string; subtotal: number; isCustomerDraft: boolean; creditLimit?: number; availableCredit?: number } | null>(null);
  readonly hasCredit = computed(() => {
    const info = this.orderInfo();
    return info?.creditLimit != null && info.creditLimit > 0;
  });

  readonly exceedsCredit = computed(() => {
    const info = this.orderInfo();
    if (!this.hasCredit()) return false;
    return info!.subtotal > (info!.availableCredit ?? 0);
  });
  readonly conversionOption = signal<ConversionOption>('none');
  readonly paymentType = signal<string>('CASH');
  readonly confirmationPassword = signal('');

  readonly canConfirm = computed(() => {
    const all = this.lines();
    return all.length > 0 && all.every((l) => l.complete);
  });

  ngOnChanges(): void {
    if (this.visible() && this.orderId()) {
      this.conversionOption.set('none');
      this.loadOrderData();
    }
    if (!this.visible()) {
      this.lines.set([]);
      this.orderInfo.set(null);
      this.error.set(null);
    }
  }

  private loadOrderData(): void {
    const id = this.orderId();
    if (!id) return;

    this.loading.set(true);
    this.error.set(null);

    this.api.getById(id).subscribe({
      next: (order) => {
        this.orderInfo.set({
          number: order.orderNumber,
          customerName: order.customerAlias,
          subtotal: order.totalAmount,
          isCustomerDraft: order.status === 'CUSTOMER_DRAFT',
          creditLimit: order.creditLimit,
          availableCredit: order.availableCredit,
        });
        if (!order.creditLimit || order.creditLimit <= 0) {
          this.paymentType.set('CASH');
        }
        this.lines.set(this.buildLines(order));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || err?.message || 'Error al cargar datos de la orden');
        this.loading.set(false);
      },
    });
  }

  private buildLines(order: OrderDetails): LineState[] {
    return order.items.map((item) => {
      const stocks = item.warehouseStocks ?? [];
      const allocations = item.warehouseAllocations ?? [];

      const warehouses: WarehouseState[] = stocks.map((s) => {
        const existing = allocations.find((a) => a.warehouseId === s.warehouseId);
        return {
          warehouseId: s.warehouseId,
          warehouseName: s.warehouseName,
          available: s.available,
          assigned: existing?.allocated ?? 0,
        };
      });

      const totalAssigned = warehouses.reduce((sum, w) => sum + w.assigned, 0);

      return {
        lineId: item.id,
        productName: item.productName,
        productCode: item.productCode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        warehouses,
        totalAssigned,
        complete: Math.abs(totalAssigned - item.quantity) < 0.0001,
      };
    });
  }

  onAssignedChange(line: LineState): void {
    const total = line.warehouses.reduce((sum, w) => sum + (w.assigned || 0), 0);
    line.totalAssigned = total;
    line.complete = Math.abs(total - line.quantity) < 0.0001;
    this.lines.set([...this.lines()]);
  }

  onSubmit(): void {
    if (!this.canConfirm()) return;
    const id = this.orderId();
    if (!id) return;

    const request: AssignOrderWarehousesRequest = {
      lines: this.lines().map((l) => ({
        lineId: l.lineId,
        allocations: l.warehouses
          .filter((w) => (w.assigned || 0) > 0)
          .map((w) => ({ warehouseId: w.warehouseId, allocatedQuantity: w.assigned || 0 })),
      })),
    };

    this.saving.set(true);
    this.api.assignWarehouses(id, request).subscribe({
      next: () => {
        this.saving.set(false);
        const option = this.conversionOption();
        if (option === 'confirm') {
          this.confirmed.emit(id);
        } else if (option === 'invoice') {
          this.convertToInvoice.emit({ orderId: id, paymentType: this.paymentType(), confirmationPassword: this.confirmationPassword() || undefined });
        } else {
          this.finished.emit();
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message || err?.message || 'Error al asignar almacenes');
      },
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
