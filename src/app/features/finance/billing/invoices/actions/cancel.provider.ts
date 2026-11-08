import { Provider } from '@angular/core';
import { map } from 'rxjs';
import { CANCEL_HANDLERS, CancelHandlerRegistration } from '@shared/services/cancel-handlers.token';
import { InvoiceApplicationService } from '@features/finance/billing/invoices/services/application/invoice-application.service';

export function provideCancelHandler(): Provider {
  return {
    provide: CANCEL_HANDLERS,
    multi: true,
    useFactory: (service: InvoiceApplicationService): CancelHandlerRegistration => ({
      resource: 'invoices',
      execute: (id: string, reason: string) =>
        service.cancel(id, reason).pipe(map(() => undefined)),
    }),
    deps: [InvoiceApplicationService],
  };
}
