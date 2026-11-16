import { Provider } from '@angular/core';
import { DELETE_HANDLERS, DeleteHandlerRegistration } from '@shared/services/delete-handlers.token';
import { PaymentMethodApplicationService } from '@features/finance/treasury/payment-methods/services/application/payment-method-application.service';

export function provideDeleteHandler(): Provider {
  return {
    provide: DELETE_HANDLERS,
    multi: true,
    useFactory: (service: PaymentMethodApplicationService): DeleteHandlerRegistration => ({
      resource: 'payment-methods',
      execute: (id: string) => service.deletePaymentMethod(id),
    }),
    deps: [PaymentMethodApplicationService],
  };
}
