import { Provider } from '@angular/core';
import { map } from 'rxjs';
import { CANCEL_HANDLERS, CancelHandlerRegistration } from '@shared/services/cancel-handlers.token';
import { OrderApplicationService } from '@features/sales/orders/services/application/order-application.service';

export function provideCancelHandler(): Provider {
  return {
    provide: CANCEL_HANDLERS,
    multi: true,
    useFactory: (service: OrderApplicationService): CancelHandlerRegistration => ({
      resource: 'orders',
      execute: (id: string, reason: string) =>
        service.cancel(id, reason).pipe(map(() => undefined)),
    }),
    deps: [OrderApplicationService],
  };
}
