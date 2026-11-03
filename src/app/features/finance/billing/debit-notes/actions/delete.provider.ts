import { Provider } from '@angular/core';
import { DELETE_HANDLERS, DeleteHandlerRegistration } from '@shared/services/delete-handlers.token';
import { DebitNoteApplicationService } from '@features/finance/billing/debit-notes/services/application/debit-note-application.service';

export function provideDeleteHandler(): Provider {
  return {
    provide: DELETE_HANDLERS,
    multi: true,
    useFactory: (service: DebitNoteApplicationService): DeleteHandlerRegistration => ({
      resource: 'debit-notes',
      execute: (id: string) => service.deleteDebitNote(id),
    }),
    deps: [DebitNoteApplicationService],
  };
}
