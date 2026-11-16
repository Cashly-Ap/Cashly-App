import { Provider } from '@angular/core';
import { DELETE_HANDLERS, DeleteHandlerRegistration } from '@shared/services/delete-handlers.token';
import { WarehouseApplicationService } from '@features/inventory/warehouses/services/application/warehouse-application.service';

export function provideDeleteHandler(): Provider {
  return {
    provide: DELETE_HANDLERS,
    multi: true,
    useFactory: (service: WarehouseApplicationService): DeleteHandlerRegistration => ({
      resource: 'warehouses',
      execute: (id: string) => service.delete(id),
    }),
    deps: [WarehouseApplicationService],
  };
}
