import { Provider } from '@angular/core';
import {
  ACTION_DIALOG_HANDLERS,
  ActionDialogHandlerRegistration,
} from '@shared/services/action-dialog-handlers.token';
import { ConfirmPurchaseDialogWrapperComponent } from '@features/procurement/purchases/components/confirm-purchase-dialog/confirm-purchase-dialog.wrapper';

export function provideConfirmHandler(): Provider {
  const registration: ActionDialogHandlerRegistration = {
    resource: 'purchases',
    label: 'Confirmar compra',
    component: ConfirmPurchaseDialogWrapperComponent,
  };
  return { provide: ACTION_DIALOG_HANDLERS, multi: true, useValue: registration };
}
