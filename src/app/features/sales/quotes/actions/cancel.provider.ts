import { Provider } from '@angular/core';
import { CANCEL_HANDLERS, CancelHandlerRegistration } from '@shared/services/cancel-handlers.token';
import { QuoteApplicationService } from '@features/sales/quotes/services/application/quote-application.service';

export function provideCancelHandler(): Provider {
  return {
    provide: CANCEL_HANDLERS,
    multi: true,
    useFactory: (service: QuoteApplicationService): CancelHandlerRegistration => ({
      resource: 'quotes',
      execute: (id: string, reason: string) => service.cancel(id, reason),
    }),
    deps: [QuoteApplicationService],
  };
}
