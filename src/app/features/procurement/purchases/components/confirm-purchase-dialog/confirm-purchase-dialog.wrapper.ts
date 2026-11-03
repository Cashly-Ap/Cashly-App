import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ActionDialogService } from '@shared/services/action-dialog.service';
import { PurchaseApplicationService } from '@features/procurement/purchases/services/application/purchase-application.service';
import { ConfirmPurchaseDialogComponent } from './confirm-purchase-dialog.component';

@Component({
  selector: 'app-confirm-purchase-dialog-wrapper',
  standalone: true,
  imports: [ConfirmPurchaseDialogComponent],
  templateUrl: './confirm-purchase-dialog.wrapper.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmPurchaseDialogWrapperComponent {
  readonly recordId = input.required<string>();
  private readonly dialogs = inject(ActionDialogService);
  private readonly purchases = inject(PurchaseApplicationService);
  private readonly messages = inject(MessageService);

  confirm(purchaseId: string): void {
    this.purchases.confirm(purchaseId).subscribe({
      next: () => {
        this.messages.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Compra confirmada exitosamente.',
          life: 3000,
        });
        this.dialogs.close();
      },
      error: () => {
        this.messages.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo confirmar la compra.',
          life: 5000,
        });
      },
    });
  }

  close(): void {
    this.dialogs.close();
  }
}
