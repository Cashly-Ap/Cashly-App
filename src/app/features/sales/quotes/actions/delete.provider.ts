import { Provider } from '@angular/core';
import { DELETE_HANDLERS, DeleteHandlerRegistration } from '@shared/services/delete-handlers.token';
import { QuoteApplicationService } from '@features/sales/quotes/services/application/quote-application.service';

export function provideDeleteHandler(): Provider {
  return {
    provide: DELETE_HANDLERS,
    multi: true,
    useFactory: (service: QuoteApplicationService): DeleteHandlerRegistration => ({
      resource: 'quotes',
      execute: (id: string) => service.delete(id),
    }),
    deps: [QuoteApplicationService],
  };
}
