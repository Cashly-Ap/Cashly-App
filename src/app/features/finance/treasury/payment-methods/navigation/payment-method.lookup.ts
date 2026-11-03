import { map } from 'rxjs';
import { LookupDefinition } from '@core/layouts/models/lookup-definition.model';
import { PaymentMethodApiService } from '@features/finance/treasury/payment-methods/services/api/payment-method-api.service';
import { documentListAction } from '@shared/models/document-list-action';
import {
  booleanLookupFilter,
  lookupDescription,
  lookupOption,
  pageLookupResult,
} from '@shared/utils/navigation-lookup';

export const PAYMENT_METHOD_LOOKUP: LookupDefinition = {
  route: '/finance/treasury/payment-methods',
  load: (injector, query) => {
    const action = documentListAction(query.label);
    return injector
      .get(PaymentMethodApiService)
      .getAll({
        search: query.search || undefined,
        action: action === 'DELETE' ? 'DELETE' : undefined,
        page: query.page,
        size: query.size,
        active: booleanLookupFilter(query.filters['active']),
      })
      .pipe(
        map((response) =>
          pageLookupResult(response, (item) => ({
            id: item.id,
            label: item.name,
            description: lookupDescription(item.code, item.description),
          })),
        ),
      );
  },
  filters: () => [
    {
      key: 'active',
      label: 'navigation.filters.active',
      options: [
        lookupOption('navigation.options.active', 'true'),
        lookupOption('navigation.options.inactive', 'false'),
      ],
      defaultValue: 'true',
    },
  ],
  recordRoutes: {
    detail: (id: string) => ['/finance/treasury/payment-methods', id],
    edit: (id: string) => ['/finance/treasury/payment-methods', id, 'edit'],
  },
};
