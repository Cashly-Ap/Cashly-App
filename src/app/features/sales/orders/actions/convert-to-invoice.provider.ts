import { Provider } from '@angular/core';
import {
  ACTION_DIALOG_HANDLERS,
  ActionDialogHandlerRegistration,
} from '@shared/services/action-dialog-handlers.token';
import { OrderConvertToInvoiceDialogWrapperComponent } from '@features/sales/orders/components/convert-to-invoice-dialog/convert-to-invoice-dialog.wrapper';

export function provideConvertToInvoiceHandler(): Provider {
  const registration: ActionDialogHandlerRegistration = {
    resource: 'orders',
    label: 'Convertir a factura',
    component: OrderConvertToInvoiceDialogWrapperComponent,
  };
  return { provide: ACTION_DIALOG_HANDLERS, multi: true, useValue: registration };
}
