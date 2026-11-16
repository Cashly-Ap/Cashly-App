import { Provider } from '@angular/core';
import { CANCEL_HANDLERS, CancelHandlerRegistration } from '@shared/services/cancel-handlers.token';
import { PurchaseApplicationService } from '@features/procurement/purchases/services/application/purchase-application.service';

export function provideCancelHandler(): Provider {
  return {
    provide: CANCEL_HANDLERS,
    multi: true,
    useFactory: (service: PurchaseApplicationService): CancelHandlerRegistration => ({
      resource: 'purchases',
      execute: (id: string, reason: string) => service.cancel(id, { reason }),
    }),
    deps: [PurchaseApplicationService],
  };
}
