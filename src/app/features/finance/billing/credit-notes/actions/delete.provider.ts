import { Provider } from '@angular/core';
import { DELETE_HANDLERS, DeleteHandlerRegistration } from '@shared/services/delete-handlers.token';
import { CreditNoteApplicationService } from '@features/finance/billing/credit-notes/services/application/credit-note-application.service';

export function provideDeleteHandler(): Provider {
  return {
    provide: DELETE_HANDLERS,
    multi: true,
    useFactory: (service: CreditNoteApplicationService): DeleteHandlerRegistration => ({
      resource: 'credit-notes',
      execute: (id: string) => service.deleteCreditNote(id),
    }),
    deps: [CreditNoteApplicationService],
  };
}
