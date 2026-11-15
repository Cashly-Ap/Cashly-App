import { Provider } from '@angular/core';
import { DELETE_HANDLERS, DeleteHandlerRegistration } from '@shared/services/delete-handlers.token';
import { ReturnApplicationService } from '@features/sales/invoices/returns/services/application/return-application.service';

export function provideDeleteHandler(): Provider {
  return {
    provide: DELETE_HANDLERS,
    multi: true,
    useFactory: (service: ReturnApplicationService): DeleteHandlerRegistration => ({
      resource: 'returns',
      execute: (id: string) => service.deleteReturn(id),
    }),
    deps: [ReturnApplicationService],
  };
}
