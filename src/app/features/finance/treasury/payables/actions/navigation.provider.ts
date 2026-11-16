import { Provider } from '@angular/core';
import {
  NAVIGATION_ACTION_HANDLERS,
  NavigationActionHandlerRegistration,
  NavigationActionRecord,
} from '@shared/services/navigation-action-handlers.token';
import { PayablesActionDialogService } from '@core/layouts/services/payables-action-dialog.service';
import { SupplierPaymentActionDialogService } from '@core/layouts/services/supplier-payment-action-dialog.service';

type PayableAction =
  | 'view'
  | 'pay_all'
  | 'pay_partial'
  | 'pay_with_validation'
  | 'refund'
  | 'advance';

const PAYABLE_ACTIONS: Record<string, PayableAction> = {
  'Ver deuda': 'view',
  'Pagar todo': 'pay_all',
  'Pago parcial': 'pay_partial',
  'Pagar con validación': 'pay_with_validation',
  Reintegro: 'refund',
  'Generar anticipo': 'advance',
};

export function provideNavigationActionHandlers(): Provider[] {
  return [
    ...Object.entries(PAYABLE_ACTIONS).map(([label, action]) => ({
      provide: NAVIGATION_ACTION_HANDLERS,
      multi: true,
      useFactory: (service: PayablesActionDialogService): NavigationActionHandlerRegistration => ({
        resource: 'payables',
        label,
        execute: (record: NavigationActionRecord) =>
          service.open({ supplierId: record.id, supplierName: record.label, action }),
      }),
      deps: [PayablesActionDialogService],
    })),
    ...['Aprobar pago', 'Rechazar pago'].map((label) => ({
      provide: NAVIGATION_ACTION_HANDLERS,
      multi: true,
      useFactory: (
        service: SupplierPaymentActionDialogService,
      ): NavigationActionHandlerRegistration => ({
        resource: 'payables',
        label,
        execute: (record: NavigationActionRecord) =>
          service.open({
            paymentId: record.id,
            action: label === 'Aprobar pago' ? 'approve' : 'reject',
          }),
      }),
      deps: [SupplierPaymentActionDialogService],
    })),
  ];
}
