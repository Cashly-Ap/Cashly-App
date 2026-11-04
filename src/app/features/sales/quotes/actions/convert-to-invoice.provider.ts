import { Provider } from '@angular/core';
import {
  ACTION_DIALOG_HANDLERS,
  ActionDialogHandlerRegistration,
} from '@shared/services/action-dialog-handlers.token';

export function provideConvertToInvoiceHandler(): Provider {
  const registration: ActionDialogHandlerRegistration = {
    resource: 'quotes',
    label: 'Convertir a factura',
    load: () =>
      import('@features/sales/quotes/components/convert-to-invoice-dialog/convert-to-invoice-dialog.wrapper').then(
        (module) => module.QuoteConvertToInvoiceDialogWrapperComponent,
      ),
  };
  return { provide: ACTION_DIALOG_HANDLERS, multi: true, useValue: registration };
}
