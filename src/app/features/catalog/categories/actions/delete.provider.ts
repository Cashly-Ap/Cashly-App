import { Provider } from '@angular/core';
import { DELETE_HANDLERS, DeleteHandlerRegistration } from '@shared/services/delete-handlers.token';
import { CategoryApplicationService } from '@features/catalog/categories/services/application/category-application.service';

export function provideDeleteHandler(): Provider {
  return {
    provide: DELETE_HANDLERS,
    multi: true,
    useFactory: (service: CategoryApplicationService): DeleteHandlerRegistration => ({
      resource: 'categories',
      execute: (id: string) => service.delete(id),
    }),
    deps: [CategoryApplicationService],
  };
}
