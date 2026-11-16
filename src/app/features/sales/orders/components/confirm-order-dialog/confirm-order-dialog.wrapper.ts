import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ActionDialogService } from '@shared/services/action-dialog.service';
import { OrderApplicationService } from '@features/sales/orders/services/application/order-application.service';
import { ConfirmOrderDialogComponent } from '@features/sales/orders/components/confirm-order-dialog/confirm-order-dialog.component';

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
          detail: 'sales.orders.messages.orderConfirmedSuccessfully',
          life: 3000,
        });
        this.dialogs.close();
      },
      error: () => {
        this.messages.add({
          severity: 'error',
          summary: 'Error',
          detail: 'sales.orders.messages.unableToConfirmTheOrderPleaseTryAgain',
          life: 5000,
        });
      },
    });
  }

  close(): void {
    this.dialogs.close();
  }
}
