import { Provider } from '@angular/core';
import { DELETE_HANDLERS, DeleteHandlerRegistration } from '@shared/services/delete-handlers.token';
import { AccessManagementService } from '@features/platform/auth/authorization/services/access-management.service';

export function provideDeleteHandler(): Provider {
  return {
    provide: DELETE_HANDLERS,
    multi: true,
    useFactory: (service: AccessManagementService): DeleteHandlerRegistration => ({
      resource: 'roles',
      execute: (id: string) => service.delete('roles', id),
    }),
    deps: [AccessManagementService],
  };
}
