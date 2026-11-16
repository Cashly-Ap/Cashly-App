import { Provider } from '@angular/core';
import { DELETE_HANDLERS, DeleteHandlerRegistration } from '@shared/services/delete-handlers.token';
import { CustomerApplicationService } from '@features/partners/customers/services/application/customer-application.service';

export function provideDeleteHandler(): Provider {
  return {
    provide: DELETE_HANDLERS,
    multi: true,
    useFactory: (service: CustomerApplicationService): DeleteHandlerRegistration => ({
      resource: 'customers',
      execute: (id: string) => service.delete(id),
    }),
    deps: [CustomerApplicationService],
  };
}
