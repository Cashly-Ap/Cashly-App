import { map } from 'rxjs';
import { LookupDefinition } from '@core/layouts/models/lookup-definition.model';
import { DebitNoteApiService } from '@features/finance/billing/debit-notes/services/api/debit-note-api.service';
import { documentListAction } from '@shared/models/document-list-action';
import {
  arrayLookupResult,
  lookupDescription,
} from '@shared/utils/navigation-lookup';

export const DEBIT_NOTE_LOOKUP: LookupDefinition = {
  route: '/finance/billing/debit-notes',
  load: (injector, query) => {
    const action = documentListAction(query.label);
    return injector
      .get(DebitNoteApiService)
      .getAll({
        search: query.search || undefined,
        action: action === 'DELETE' ? 'DELETE' : undefined,
      })
      .pipe(
        map((items) =>
          arrayLookupResult(
            items,
            (item) => ({
              id: item.id,
              label: item.noteNumber,
              description: lookupDescription(item.customerName, item.invoiceNumber),
            }),
            query.search,
            query.page,
            query.size,
          ),
        ),
      );
  },
  filters: () => [],
  recordRoutes: {
    detail: (id: string) => ['/finance/billing/debit-notes', id],
    edit: (id: string) => ['/finance/billing/debit-notes', id, 'edit'],
  },
};
