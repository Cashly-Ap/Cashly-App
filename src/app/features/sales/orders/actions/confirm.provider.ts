import { Provider } from '@angular/core';
import {
  ACTION_DIALOG_HANDLERS,
  ActionDialogHandlerRegistration,
} from '@shared/services/action-dialog-handlers.token';
import { ConfirmOrderDialogWrapperComponent } from '@features/sales/orders/components/confirm-order-dialog/confirm-order-dialog.wrapper';

export function provideConfirmHandler(): Provider {
  const registration: ActionDialogHandlerRegistration = {
    resource: 'orders',
    label: 'Confirmar',
    component: ConfirmOrderDialogWrapperComponent,
  };
  return { provide: ACTION_DIALOG_HANDLERS, multi: true, useValue: registration };
}
