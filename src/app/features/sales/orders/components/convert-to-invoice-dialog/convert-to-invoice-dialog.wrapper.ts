import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ActionDialogService } from '@shared/services/action-dialog.service';
import { OrderApiService } from '@features/sales/orders/services/api/order-api.service';
import { OrderApplicationService } from '@features/sales/orders/services/application/order-application.service';
import { OrderDetails } from '@features/sales/orders/models/interfaces/order-details.interface';
import { ConvertToInvoiceRequest } from '@features/sales/orders/services/api/order-api.service';
import { ConvertToInvoiceDialogComponent } from './convert-to-invoice-dialog.component';

@Component({
  selector: 'app-order-convert-to-invoice-dialog-wrapper',
  standalone: true,
  imports: [ConvertToInvoiceDialogComponent],
  templateUrl: './convert-to-invoice-dialog.wrapper.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderConvertToInvoiceDialogWrapperComponent implements OnInit {
  readonly recordId = input.required<string>();
  private readonly dialogs = inject(ActionDialogService);
  private readonly api = inject(OrderApiService);
  private readonly orders = inject(OrderApplicationService);
  private readonly messages = inject(MessageService);
  readonly details = signal<OrderDetails | null>(null);

  ngOnInit(): void {
    this.api.getById(this.recordId()).subscribe({
      next: (details) => this.details.set(details),
      error: () => {
        this.messages.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los datos del pedido.',
          life: 5000,
        });
        this.dialogs.close();
      },
    });
  }

  convert(request: ConvertToInvoiceRequest): void {
    this.orders.convertToInvoice(this.recordId(), request).subscribe({
      next: () => {
        this.messages.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Pedido convertido a factura exitosamente.',
          life: 3000,
        });
        this.dialogs.close();
      },
      error: () => {
        this.messages.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo convertir el pedido a factura.',
          life: 5000,
        });
      },
    });
  }

  close(): void {
    this.dialogs.close();
  }
}
