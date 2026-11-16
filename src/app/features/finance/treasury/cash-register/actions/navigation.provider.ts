import { Provider } from '@angular/core';
import {
  DIRECT_NAVIGATION_ACTION_HANDLERS,
  DirectNavigationActionHandlerRegistration,
} from '@shared/services/direct-navigation-action-handlers.token';
import {
  CashRegisterActionDialogService,
  CashRegisterActionKind,
} from '@core/layouts/services/cash-register-action-dialog.service';

const CASH_REGISTER_ACTIONS: Record<string, CashRegisterActionKind> = {
  'Abrir caja': 'open',
  'Cerrar caja': 'close',
  'Ver detalles': 'detail',
};

export function provideDirectNavigationActionHandlers(): Provider[] {
  return Object.entries(CASH_REGISTER_ACTIONS).map(([label, action]) => ({
    provide: DIRECT_NAVIGATION_ACTION_HANDLERS,
    multi: true,
    useFactory: (
      service: CashRegisterActionDialogService,
    ): DirectNavigationActionHandlerRegistration => ({
      resource: 'cash-register',
      label,
      execute: () => service.open({ action }),
    }),
    deps: [CashRegisterActionDialogService],
  }));
}
