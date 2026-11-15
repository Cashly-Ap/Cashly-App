import { map } from 'rxjs';
import { LookupDefinition } from '@core/layouts/models/lookup-definition.model';
import { ReturnApiService } from '@features/sales/invoices/returns/services/api/return-api.service';
import { documentListAction } from '@shared/models/document-list-action';
import { lookupDescription, pageLookupResult } from '@shared/utils/navigation-lookup';

export const RETURN_LOOKUP: LookupDefinition = {
  route: '/sales/returns',
  load: (injector, query) => {
    const action = documentListAction(query.label);
    return injector
      .get(ReturnApiService)
      .getAll({
        search: query.search || undefined,
        action: action === 'DELETE' ? 'DELETE' : undefined,
        page: query.page,
        size: query.size,
      })
      .pipe(
        map((response) =>
          pageLookupResult(response, (item) => ({
            id: item.id,
            label: item.returnNumber,
            description: lookupDescription(item.customerName, item.invoiceNumber),
          })),
        ),
      );
  },
  filters: () => [],
  recordRoutes: {
    detail: (id: string) => ['/sales/returns', id],
    edit: (id: string) => ['/sales/returns', id, 'edit'],
  },
};
