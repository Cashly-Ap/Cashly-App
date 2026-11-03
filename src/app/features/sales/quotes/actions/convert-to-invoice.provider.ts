import { Provider } from '@angular/core';
import {
  ACTION_DIALOG_HANDLERS,
  ActionDialogHandlerRegistration,
} from '@shared/services/action-dialog-handlers.token';
import { QuoteConvertToInvoiceDialogWrapperComponent } from '@features/sales/quotes/components/convert-to-invoice-dialog/convert-to-invoice-dialog.wrapper';

export function provideConvertToInvoiceHandler(): Provider {
  const registration: ActionDialogHandlerRegistration = {
    resource: 'quotes',
    label: 'Convertir a factura',
    component: QuoteConvertToInvoiceDialogWrapperComponent,
  };
  return { provide: ACTION_DIALOG_HANDLERS, multi: true, useValue: registration };
}
