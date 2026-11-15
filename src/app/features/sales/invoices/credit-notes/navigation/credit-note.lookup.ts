import { map } from 'rxjs';
import { LookupDefinition } from '@core/layouts/models/lookup-definition.model';
import { CreditNoteApiService } from '@features/sales/invoices/credit-notes/services/api/credit-note-api.service';
import { documentListAction } from '@shared/models/document-list-action';
import { lookupDescription, pageLookupResult } from '@shared/utils/navigation-lookup';

export const CREDIT_NOTE_LOOKUP: LookupDefinition = {
  route: '/sales/credit-notes',
  load: (injector, query) => {
    const action = documentListAction(query.label);
    return injector
      .get(CreditNoteApiService)
      .getAll({
        action: action === 'DELETE' ? 'DELETE' : undefined,
        page: query.page,
        size: query.size,
      })
      .pipe(
        map((response) =>
          pageLookupResult(response, (item) => ({
            id: item.id,
            label: item.noteNumber,
            description: lookupDescription(item.customerName, item.invoiceNumber),
          })),
        ),
      );
  },
  filters: () => [],
  recordRoutes: {
    detail: (id: string) => ['/sales/credit-notes', id],
    edit: (id: string) => ['/sales/credit-notes', id, 'edit'],
  },
};
