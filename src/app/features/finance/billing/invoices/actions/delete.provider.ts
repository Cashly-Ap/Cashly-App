import { Provider } from '@angular/core';
import { DELETE_HANDLERS, DeleteHandlerRegistration } from '@shared/services/delete-handlers.token';
import { InvoiceApplicationService } from '@features/finance/billing/invoices/services/application/invoice-application.service';

export function provideDeleteHandler(): Provider {
  return {
    provide: DELETE_HANDLERS,
    multi: true,
    useFactory: (service: InvoiceApplicationService): DeleteHandlerRegistration => ({
      resource: 'invoices',
      execute: (id: string) => service.delete(id),
    }),
    deps: [InvoiceApplicationService],
  };
}
