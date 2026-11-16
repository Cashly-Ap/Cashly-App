import { Provider } from '@angular/core';
import {
  NAVIGATION_ACTION_HANDLERS,
  NavigationActionHandlerRegistration,
  NavigationActionRecord,
} from '@shared/services/navigation-action-handlers.token';
import { InvoiceActionDialogService } from '@core/layouts/services/invoice-action-dialog.service';

const INVOICE_ACTIONS: Record<string, 'confirm' | 'duplicate'> = {
  Confirmar: 'confirm',
  Duplicar: 'duplicate',
};

export function provideNavigationActionHandlers(): Provider[] {
  return Object.entries(INVOICE_ACTIONS).map(([label, action]) => ({
    provide: NAVIGATION_ACTION_HANDLERS,
    multi: true,
    useFactory: (service: InvoiceActionDialogService): NavigationActionHandlerRegistration => ({
      resource: 'invoices',
      label,
      execute: (record: NavigationActionRecord) =>
        service.open({
          invoiceId: record.id,
          invoiceNumber: record.label,
          action,
        }),
    }),
    deps: [InvoiceActionDialogService],
  }));
}
