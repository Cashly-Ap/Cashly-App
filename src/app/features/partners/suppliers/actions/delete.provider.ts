import { Provider } from '@angular/core';
import { DELETE_HANDLERS, DeleteHandlerRegistration } from '@shared/services/delete-handlers.token';
import { SupplierApplicationService } from '@features/partners/suppliers/services/application/supplier-application.service';

export function provideDeleteHandler(): Provider {
  return {
    provide: DELETE_HANDLERS,
    multi: true,
    useFactory: (service: SupplierApplicationService): DeleteHandlerRegistration => ({
      resource: 'suppliers',
      execute: (id: string) => service.delete(id),
    }),
    deps: [SupplierApplicationService],
  };
}
