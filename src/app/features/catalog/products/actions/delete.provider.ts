import { Provider } from '@angular/core';
import { DELETE_HANDLERS, DeleteHandlerRegistration } from '@shared/services/delete-handlers.token';
import { ProductApplicationService } from '@features/catalog/products/services/application/product-application.service';

export function provideDeleteHandler(): Provider {
  return {
    provide: DELETE_HANDLERS,
    multi: true,
    useFactory: (service: ProductApplicationService): DeleteHandlerRegistration => ({
      resource: 'products',
      execute: (id: string) => service.delete(id),
    }),
    deps: [ProductApplicationService],
  };
}
