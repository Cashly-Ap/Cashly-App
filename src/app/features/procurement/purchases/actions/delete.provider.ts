import { Provider } from '@angular/core';
import { DELETE_HANDLERS, DeleteHandlerRegistration } from '@shared/services/delete-handlers.token';
import { PurchaseApplicationService } from '@features/procurement/purchases/services/application/purchase-application.service';

export function provideDeleteHandler(): Provider {
  return {
    provide: DELETE_HANDLERS,
    multi: true,
    useFactory: (service: PurchaseApplicationService): DeleteHandlerRegistration => ({
      resource: 'purchases',
      execute: (id: string) => service.delete(id),
    }),
    deps: [PurchaseApplicationService],
  };
}
