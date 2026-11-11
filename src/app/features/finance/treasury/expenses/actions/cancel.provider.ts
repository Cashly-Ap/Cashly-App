import { Provider } from '@angular/core';
import { map } from 'rxjs';
import { CANCEL_HANDLERS, CancelHandlerRegistration } from '@shared/services/cancel-handlers.token';
import { ExpensesApplicationService } from '@features/finance/treasury/expenses/services/application/expenses-application.service';

export function provideCancelHandler(): Provider {
  return {
    provide: CANCEL_HANDLERS,
    multi: true,
    useFactory: (service: ExpensesApplicationService): CancelHandlerRegistration => ({
      resource: 'expenses',
      execute: (id: string, reason: string) =>
        service.cancelExpense(id, reason).pipe(map(() => undefined)),
    }),
    deps: [ExpensesApplicationService],
  };
}
