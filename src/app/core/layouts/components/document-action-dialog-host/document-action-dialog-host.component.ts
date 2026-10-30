import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DocumentActionDialogService } from '@core/layouts/services/document-action-dialog.service';
import { ConfirmOrderDialogComponent } from '@features/sales/orders/components/confirm-order-dialog/confirm-order-dialog.component';
import { CancelOrderDialogComponent } from '@features/sales/orders/components/cancel-order-dialog/cancel-order-dialog.component';
import { ConvertToInvoiceDialogComponent as OrderInvoiceDialogComponent } from '@features/sales/orders/components/convert-to-invoice-dialog/convert-to-invoice-dialog.component';
import { ConvertToOrderDialogComponent } from '@features/sales/quotes/components/convert-to-order-dialog/convert-to-order-dialog.component';
import { ConvertToInvoiceDialogComponent as QuoteInvoiceDialogComponent } from '@features/sales/quotes/components/convert-to-invoice-dialog/convert-to-invoice-dialog.component';
import { ConfirmPurchaseDialogComponent } from '@features/procurement/purchases/components/confirm-purchase-dialog/confirm-purchase-dialog.component';
import { CancelPurchaseDialogComponent } from '@features/procurement/purchases/components/cancel-purchase-dialog/cancel-purchase-dialog.component';
import {
  OrderApiService,
  ConvertToInvoiceRequest as OrderInvoiceRequest,
} from '@features/sales/orders/services/api/order-api.service';
import { OrderApplicationService } from '@features/sales/orders/services/application/order-application.service';
import { OrderDetails } from '@features/sales/orders/models/interfaces/order-details.interface';
import { OrderList } from '@features/sales/orders/models/interfaces/order-list.interface';
import { OrderStatus } from '@features/sales/orders/models/enums/order-status.enum';
import { QuoteApplicationService } from '@features/sales/quotes/services/application/quote-application.service';
import { ConvertToInvoiceRequest as QuoteInvoiceRequest } from '@features/sales/quotes/services/api/quote-api.service';
import { PurchaseApplicationService } from '@features/procurement/purchases/services/application/purchase-application.service';
import { CancelPurchaseRequest } from '@features/procurement/purchases/services/api/purchase-api.service';

@Component({
  selector: 'app-document-action-dialog-host',
  standalone: true,
  imports: [
    ConfirmOrderDialogComponent,
    CancelOrderDialogComponent,
    OrderInvoiceDialogComponent,
    ConvertToOrderDialogComponent,
    QuoteInvoiceDialogComponent,
    ConfirmPurchaseDialogComponent,
    CancelPurchaseDialogComponent,
  ],
  templateUrl: './document-action-dialog-host.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentActionDialogHostComponent {
  readonly actions = inject(DocumentActionDialogService);
  private readonly orders = inject(OrderApplicationService);
  private readonly orderApi = inject(OrderApiService);
  private readonly quotes = inject(QuoteApplicationService);
  private readonly purchases = inject(PurchaseApplicationService);
  private readonly messages = inject(MessageService);
  readonly orderDetails = signal<OrderDetails | null>(null);
  private loadVersion = 0;

  constructor() {
    effect(() => {
      const request = this.actions.request();
      const version = ++this.loadVersion;
      this.orderDetails.set(null);
      if (request?.route !== '/sales/orders' || request.label !== 'Convertir a factura') return;
      this.orderApi.getById(request.recordId).subscribe({
        next: (details) => {
          if (version === this.loadVersion) this.orderDetails.set(details);
        },
        error: () => {
          if (version === this.loadVersion)
            this.fail('No se pudieron cargar los datos del pedido.');
        },
      });
    });
  }

  orderForCancellation(): OrderList | null {
    const request = this.actions.request();
    if (request?.route !== '/sales/orders') return null;
    return {
      id: request.recordId,
      orderNumber: request.recordLabel,
      customerAlias: '',
      customerId: '',
      status: OrderStatus.DRAFT,
      totalAmount: 0,
      createdAt: '',
    };
  }

  confirmOrder(orderId: string): void {
    this.actions.close();
    this.orders.confirm(orderId).subscribe({
      next: () => this.succeed('Pedido confirmado exitosamente.'),
      error: () => this.fail('No se pudo confirmar el pedido.'),
    });
  }

  cancelOrder(event: { orderId: string; reason: string }): void {
    this.actions.close();
    this.orders.cancel(event.orderId, event.reason).subscribe({
      next: () => this.succeed('Pedido cancelado exitosamente.'),
      error: () => this.fail('No se pudo cancelar el pedido.'),
    });
  }

  convertOrderToInvoice(request: OrderInvoiceRequest): void {
    const recordId = this.actions.request()?.recordId;
    if (!recordId) return;
    this.actions.close();
    this.orders.convertToInvoice(recordId, request).subscribe({
      next: () => this.succeed('Pedido convertido a factura exitosamente.'),
      error: () => this.fail('No se pudo convertir el pedido a factura.'),
    });
  }

  convertQuoteToOrder(): void {
    const recordId = this.actions.request()?.recordId;
    if (!recordId) return;
    this.actions.close();
    this.quotes.convertToOrder(recordId).subscribe({
      next: () => this.succeed('Presupuesto convertido a pedido exitosamente.'),
      error: () => this.fail('No se pudo convertir el presupuesto a pedido.'),
    });
  }

  convertQuoteToInvoice(request: QuoteInvoiceRequest): void {
    const recordId = this.actions.request()?.recordId;
    if (!recordId) return;
    this.actions.close();
    this.quotes.convertToInvoice(recordId, request).subscribe({
      next: () => this.succeed('Presupuesto convertido a factura exitosamente.'),
      error: () => this.fail('No se pudo convertir el presupuesto a factura.'),
    });
  }

  confirmPurchase(purchaseId: string): void {
    this.actions.close();
    this.purchases.confirm(purchaseId).subscribe({
      next: () => this.succeed('Compra confirmada exitosamente.'),
      error: () => this.fail('No se pudo confirmar la compra.'),
    });
  }

  cancelPurchase(request: CancelPurchaseRequest): void {
    const recordId = this.actions.request()?.recordId;
    if (!recordId) return;
    this.actions.close();
    this.purchases.cancel(recordId, request).subscribe({
      next: () => this.succeed('Compra cancelada exitosamente.'),
      error: () => this.fail('No se pudo cancelar la compra.'),
    });
  }

  private succeed(detail: string): void {
    this.messages.add({ severity: 'success', summary: 'Éxito', detail, life: 3000 });
    this.actions.close();
  }

  private fail(detail: string): void {
    this.messages.add({ severity: 'error', summary: 'Error', detail, life: 5000 });
  }
}
