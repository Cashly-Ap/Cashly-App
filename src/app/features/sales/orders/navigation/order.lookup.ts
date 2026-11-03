import { map } from 'rxjs';
import { LookupDefinition } from '@core/layouts/models/lookup-definition.model';
import { OrderApiService } from '@features/sales/orders/services/api/order-api.service';
import { OrderStatus } from '@features/sales/orders/models/enums/order-status.enum';
import { documentListAction } from '@shared/models/document-list-action';
import {
  arrayLookupResult,
  lookupDescription,
  lookupStatusKey,
} from '@shared/utils/navigation-lookup';

const option = (label: string, value: string) => ({ label, value });

const ORDER_STATUS_OPTIONS = [
  option('navigation.options.all', ''),
  option('navigation.options.draft', OrderStatus.DRAFT),
  option('navigation.options.confirmed', OrderStatus.CONFIRMED),
  option('navigation.options.cancelled', OrderStatus.CANCELLED),
  option('navigation.options.invoiced', OrderStatus.INVOICED),
];

export const ORDER_LOOKUP: LookupDefinition = {
  route: '/sales/orders',
  load: (injector, query) => {
    const api = injector.get(OrderApiService);
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
              label: item.orderNumber,
              description: lookupDescription(item.customerAlias, lookupStatusKey(item.status)),
            }),
            query.search,
            query.page,
            query.size,
          ),
        ),
      );
  },
  filters: () => [
    {
      key: 'status',
      label: 'navigation.filters.status',
      options: ORDER_STATUS_OPTIONS,
      defaultValue: '',
    },
  ],
  recordRoutes: {
    detail: (id: string) => ['/sales/orders', id],
    edit: (id: string) => ['/sales/orders', id, 'edit'],
  },
};
