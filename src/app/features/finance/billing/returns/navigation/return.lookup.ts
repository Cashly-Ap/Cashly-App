import { map } from 'rxjs';
import { LookupDefinition } from '@core/layouts/models/lookup-definition.model';
import { ReturnApiService } from '@features/finance/billing/returns/services/api/return-api.service';
import { documentListAction } from '@shared/models/document-list-action';
import { arrayLookupResult, lookupDescription } from '@shared/utils/navigation-lookup';

export const RETURN_LOOKUP: LookupDefinition = {
  route: '/finance/billing/returns',
  load: (injector, query) => {
    const action = documentListAction(query.label);
    return injector
      .get(ReturnApiService)
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
              label: item.returnNumber,
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
    detail: (id: string) => ['/finance/billing/returns', id],
    edit: (id: string) => ['/finance/billing/returns', id, 'edit'],
  },
};
