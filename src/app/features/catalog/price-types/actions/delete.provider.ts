import { Provider } from '@angular/core';
import { DELETE_HANDLERS, DeleteHandlerRegistration } from '@shared/services/delete-handlers.token';
import { PriceTypeApplicationService } from '@features/catalog/price-types/services/application/price-type-application.service';

export function provideDeleteHandler(): Provider {
  return {
    provide: DELETE_HANDLERS,
    multi: true,
    useFactory: (service: PriceTypeApplicationService): DeleteHandlerRegistration => ({
      resource: 'price-types',
      execute: (id: string) => service.remove(id),
    }),
    deps: [PriceTypeApplicationService],
  };
}
