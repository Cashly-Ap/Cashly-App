import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ActionDialogService } from '@shared/services/action-dialog.service';
import { OrderApplicationService } from '@features/sales/orders/services/application/order-application.service';
import { ConfirmOrderDialogComponent } from './confirm-order-dialog.component';

@Component({
  selector: 'app-confirm-order-dialog-wrapper',
  standalone: true,
  imports: [ConfirmOrderDialogComponent],
  templateUrl: './confirm-order-dialog.wrapper.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmOrderDialogWrapperComponent {
  readonly recordId = input.required<string>();
  private readonly dialogs = inject(ActionDialogService);
  private readonly orders = inject(OrderApplicationService);
  private readonly messages = inject(MessageService);

  confirm(orderId: string): void {
    this.orders.confirm(orderId).subscribe({
      next: () => {
        this.messages.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Pedido confirmado exitosamente.',
          life: 3000,
        });
        this.dialogs.close();
      },
      error: () => {
        this.messages.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo confirmar el pedido.',
          life: 5000,
        });
      },
    });
  }

  close(): void {
    this.dialogs.close();
  }
}
