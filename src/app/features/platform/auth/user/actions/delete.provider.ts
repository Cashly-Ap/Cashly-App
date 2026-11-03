import { Provider } from '@angular/core';
import { DELETE_HANDLERS, DeleteHandlerRegistration } from '@shared/services/delete-handlers.token';
import { UserApplicationService } from '@features/platform/auth/user/services/application/user-application.service';

export function provideDeleteHandler(): Provider {
  return {
    provide: DELETE_HANDLERS,
    multi: true,
    useFactory: (service: UserApplicationService): DeleteHandlerRegistration => ({
      resource: 'users',
      execute: (id: string) => service.deleteUser(id),
    }),
    deps: [UserApplicationService],
  };
}
