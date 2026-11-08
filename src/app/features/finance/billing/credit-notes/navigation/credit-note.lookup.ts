import { map } from 'rxjs';
import { LookupDefinition } from '@core/layouts/models/lookup-definition.model';
import { CreditNoteApiService } from '@features/finance/billing/credit-notes/services/api/credit-note-api.service';
import { documentListAction } from '@shared/models/document-list-action';
import { arrayLookupResult, lookupDescription } from '@shared/utils/navigation-lookup';

export const CREDIT_NOTE_LOOKUP: LookupDefinition = {
  route: '/finance/billing/credit-notes',
  load: (injector, query) => {
    const action = documentListAction(query.label);
    return injector
      .get(CreditNoteApiService)
      .getAll({ action: action === 'DELETE' ? 'DELETE' : undefined })
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
    detail: (id: string) => ['/finance/billing/credit-notes', id],
    edit: (id: string) => ['/finance/billing/credit-notes', id, 'edit'],
  },
};
