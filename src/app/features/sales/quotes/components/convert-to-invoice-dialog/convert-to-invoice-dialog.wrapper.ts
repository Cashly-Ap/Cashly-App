import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ActionDialogService } from '@shared/services/action-dialog.service';
import { QuoteApplicationService } from '@features/sales/quotes/services/application/quote-application.service';
import { ConvertToInvoiceRequest } from '@features/sales/quotes/services/api/quote-api.service';
import { ConvertToInvoiceDialogComponent } from '@features/sales/quotes/components/convert-to-invoice-dialog/convert-to-invoice-dialog.component';

@Component({
  selector: 'app-quote-convert-to-invoice-dialog-wrapper',
  standalone: true,
  imports: [ConvertToInvoiceDialogComponent],
  templateUrl: './convert-to-invoice-dialog.wrapper.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteConvertToInvoiceDialogWrapperComponent {
  readonly recordId = input.required<string>();
  private readonly dialogs = inject(ActionDialogService);
  private readonly quotes = inject(QuoteApplicationService);
  private readonly messages = inject(MessageService);

  convert(request: ConvertToInvoiceRequest): void {
    this.quotes.convertToInvoice(this.recordId(), request).subscribe({
      next: () => {
        this.messages.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'sales.quotes.messages.quoteConvertedToAnInvoiceSuccessfully',
          life: 3000,
        });
        this.dialogs.close();
      },
      error: () => {
        this.messages.add({
          severity: 'error',
          summary: 'Error',
          detail: 'sales.quotes.messages.unableToConvertTheQuoteToAnInvoicePleaseTryAgain',
          life: 5000,
        });
      },
    });
  }

  close(): void {
    this.dialogs.close();
  }
}
