import { Provider } from '@angular/core';
import {
  ACTION_DIALOG_HANDLERS,
  ActionDialogHandlerRegistration,
} from '@shared/services/action-dialog-handlers.token';

export function provideConvertToOrderHandler(): Provider {
  const registration: ActionDialogHandlerRegistration = {
    resource: 'quotes',
    label: 'Convertir a pedido',
    load: () =>
      import(
        '@features/sales/quotes/components/convert-to-order-dialog/convert-to-order-dialog.wrapper'
      ).then((module) => module.ConvertToOrderDialogWrapperComponent),
  };
  return { provide: ACTION_DIALOG_HANDLERS, multi: true, useValue: registration };
}
