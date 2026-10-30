import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { OrderApiService } from '@features/sales/orders/services/api/order-api.service';
import { OrderDetails } from '@features/sales/orders/models/interfaces/order-details.interface';
import { DocumentConfirmationDialogComponent } from '@shared/components/document-confirmation-dialog/document-confirmation-dialog.component';
import { DocumentConfirmationModel } from '@shared/models/document-confirmation';
import { reviewDocumentStock } from '@shared/utils/document-stock';
import { orderStockLines } from '@features/sales/orders/models/order-stock';

@Component({
  selector: 'app-confirm-order-dialog',
  standalone: true,
  imports: [DocumentConfirmationDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirm-order-dialog.component.html',
})
export class ConfirmOrderDialogComponent implements OnChanges {
  private readonly api = inject(OrderApiService);
  private requestVersion = 0;
  readonly visible = input(false);
  readonly orderId = input<string | null>(null);
  readonly confirmed = output<string>();
  readonly cancelled = output<void>();
  readonly details = signal<OrderDetails | null>(null);
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly stock = computed(() => reviewDocumentStock(orderStockLines(this.details())));
  readonly confirmationModel = computed<DocumentConfirmationModel>(() => {
    const order = this.details();
    const rows = this.stock().rows.map((row) => ({
      ...row,
      availableAfter: row.available - row.quantity,
    }));
    return {
      title: 'Confirmar Pedido',
      subtitle: 'Revise el stock antes de confirmar el pedido',
      icon: 'pi-check-circle',
      summaryFields: order
        ? [
            {
              label: 'finance.billing.invoices.order',
              value: `#${order.orderNumber}`,
              monospace: true,
            },
            { label: 'finance.billing.invoices.customer', value: order.customerAlias },
          ]
        : [],
      notice: {
        severity: this.stock().valid ? 'info' : 'danger',
        title: this.stock().valid
          ? 'El stock se reservará al confirmar el pedido.'
          : 'sales.quotes.unableToConvert',
        description: this.stock().valid
          ? undefined
          : 'shared.thereIsNotEnoughStockInOneOrMoreWarehousesConversionWouldReserveStockAndResultInNegativeInventory',
      },
      inventory: { rows, blocking: !this.stock().valid },
      acceptLabel: 'Sí, confirmar',
      acceptIcon: 'pi pi-check',
      acceptSeverity: 'success',
      permissionAction: 'EXECUTE',
      requiredPermissions: ['INVENTORY:EXECUTE'],
    };
  });
  readonly canConfirm = computed(
    () =>
      !!this.details() &&
      !this.loading() &&
      !this.error() &&
      !this.submitting() &&
      this.stock().valid,
  );

  ngOnChanges(): void {
    const version = ++this.requestVersion;
    this.details.set(null);
    this.error.set(null);
    this.submitting.set(false);
    this.loading.set(false);
    const id = this.orderId();
    if (!this.visible() || !id) return;
    this.loading.set(true);
    this.api.getById(id).subscribe({
      next: (details) => {
        if (version !== this.requestVersion) return;
        this.details.set(details);
        this.loading.set(false);
      },
      error: () => {
        if (version !== this.requestVersion) return;
        this.error.set('Error al cargar los detalles del pedido.');
        this.loading.set(false);
      },
    });
  }

  onConfirm(): void {
    const id = this.orderId();
    if (!id || !this.canConfirm()) return;
    this.submitting.set(true);
    this.confirmed.emit(id);
  }
}
