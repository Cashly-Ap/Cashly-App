import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ActionDialogService } from '@shared/services/action-dialog.service';
import { QuoteApplicationService } from '@features/sales/quotes/services/application/quote-application.service';
import { ConvertToOrderDialogComponent } from './convert-to-order-dialog.component';

@Component({
  selector: 'app-convert-to-order-dialog-wrapper',
  standalone: true,
  imports: [ConvertToOrderDialogComponent],
  templateUrl: './convert-to-order-dialog.wrapper.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConvertToOrderDialogWrapperComponent {
  readonly recordId = input.required<string>();
  private readonly dialogs = inject(ActionDialogService);
  private readonly quotes = inject(QuoteApplicationService);
  private readonly messages = inject(MessageService);

  convert(): void {
    this.quotes.convertToOrder(this.recordId()).subscribe({
      next: () => {
        this.messages.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Presupuesto convertido a pedido exitosamente.',
          life: 3000,
        });
        this.dialogs.close();
      },
      error: () => {
        this.messages.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo convertir el presupuesto a pedido.',
          life: 5000,
        });
      },
    });
  }

  close(): void {
    this.dialogs.close();
  }
}
