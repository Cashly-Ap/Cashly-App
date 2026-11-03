import { map } from 'rxjs';
import { LookupDefinition } from '@core/layouts/models/lookup-definition.model';
import { LookupFilterSources } from '@core/layouts/models/lookup-definition.model';
import { QuoteApiService } from '@features/sales/quotes/services/api/quote-api.service';
import { QuoteStatus } from '@features/sales/quotes/models/enums/quote-status.enum';
import { documentListAction } from '@shared/models/document-list-action';
import {
  arrayLookupResult,
  lookupDescription,
  lookupStatusKey,
} from '@shared/utils/navigation-lookup';

const option = (label: string, value: string) => ({ label, value });

const QUOTE_STATUS_OPTIONS = [
  option('navigation.options.all', ''),
  option('navigation.options.draft', QuoteStatus.DRAFT),
  option('navigation.options.convertedToOrder', QuoteStatus.CONVERTED_TO_ORDER),
  option('navigation.options.convertedToInvoice', QuoteStatus.CONVERTED_TO_INVOICE),
  option('navigation.options.cancelled', QuoteStatus.CANCELLED),
];

export const QUOTE_LOOKUP: LookupDefinition = {
  route: '/sales/quotes',
  load: (injector, query) => {
    const api = injector.get(QuoteApiService);
    const action = documentListAction(query.label);
    const requestedAction = action === 'DELETE' ? 'DELETE' : undefined;
    const listAction = action === 'CANCEL' ? undefined : action;
    return api
      .getAll(
        requestedAction
          ? { search: query.search || undefined, action: requestedAction }
          : {
              search: query.search || undefined,
              ...(listAction
                ? { action: listAction }
                : { status: query.filters['status'] || 'ALL' }),
            },
      )
      .pipe(
        map((items) =>
          arrayLookupResult(
            items,
            (item) => ({
              id: item.id,
              label: item.quoteNumber,
              description: lookupDescription(item.customerName, lookupStatusKey(item.status)),
            }),
            query.search,
            query.page,
            query.size,
          ),
        ),
      );
  },
  filters: (_sources: LookupFilterSources) => [
    {
      key: 'status',
      label: 'navigation.filters.status',
      options: QUOTE_STATUS_OPTIONS,
      defaultValue: '',
    },
  ],
  recordRoutes: {
    detail: (id: string) => ['/sales/quotes', id],
    edit: (id: string) => ['/sales/quotes', id, 'edit'],
  },
};
