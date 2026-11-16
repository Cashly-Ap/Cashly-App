import { Provider } from '@angular/core';
import {
  NAVIGATION_ACTION_HANDLERS,
  NavigationActionHandlerRegistration,
  NavigationActionRecord,
} from '@shared/services/navigation-action-handlers.token';
import { ReceivablesActionDialogService } from '@core/layouts/services/receivables-action-dialog.service';
import { PendingPaymentActionDialogService } from '@core/layouts/services/pending-payment-action-dialog.service';

type ReceivableAction =
  | 'view'
  | 'pay_all'
  | 'pay_partial'
  | 'pay_with_validation'
  | 'refund'
  | 'advance';

const RECEIVABLE_ACTIONS: Record<string, ReceivableAction> = {
  'Ver deuda': 'view',
  'Pagar todo': 'pay_all',
  'Pago parcial': 'pay_partial',
  'Pagar con validación': 'pay_with_validation',
  Reintegro: 'refund',
  'Generar anticipo': 'advance',
};

export function provideNavigationActionHandlers(): Provider[] {
  return [
    ...Object.entries(RECEIVABLE_ACTIONS).map(([label, action]) => ({
      provide: NAVIGATION_ACTION_HANDLERS,
      multi: true,
      useFactory: (
        service: ReceivablesActionDialogService,
      ): NavigationActionHandlerRegistration => ({
        resource: 'receivables',
        label,
        execute: (record: NavigationActionRecord) =>
          service.open({ customerId: record.id, customerName: record.label, action }),
      }),
      deps: [ReceivablesActionDialogService],
    })),
    ...['Aprobar pago', 'Rechazar pago'].map((label) => ({
      provide: NAVIGATION_ACTION_HANDLERS,
      multi: true,
      useFactory: (
        service: PendingPaymentActionDialogService,
      ): NavigationActionHandlerRegistration => ({
        resource: 'receivables',
        label,
        execute: (record: NavigationActionRecord) =>
          service.open({
            paymentId: record.id,
            action: label === 'Aprobar pago' ? 'approve' : 'reject',
          }),
      }),
      deps: [PendingPaymentActionDialogService],
    })),
  ];
}
