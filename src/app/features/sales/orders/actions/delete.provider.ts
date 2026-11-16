import { Provider } from '@angular/core';
import { DELETE_HANDLERS, DeleteHandlerRegistration } from '@shared/services/delete-handlers.token';
import { OrderApplicationService } from '@features/sales/orders/services/application/order-application.service';

export function provideDeleteHandler(): Provider {
  return {
    provide: DELETE_HANDLERS,
    multi: true,
    useFactory: (service: OrderApplicationService): DeleteHandlerRegistration => ({
      resource: 'orders',
      execute: (id: string) => service.delete(id),
    }),
    deps: [OrderApplicationService],
  };
}
