import { map } from 'rxjs';
import { LookupDefinition } from '@core/layouts/models/lookup-definition.model';
import { OrderApiService } from '@features/sales/orders/services/api/order-api.service';
import { OrderStatus } from '@features/sales/orders/models/enums/order-status.enum';
import { documentListAction } from '@shared/models/document-list-action';
import {
  lookupDescription,
  lookupStatusKey,
  pageLookupResult,
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
    const paging = { page: query.page, size: query.size };
    return api
      .getAll(
        requestedAction
          ? { ...paging, search: query.search || undefined, action: requestedAction }
          : {
              ...paging,
              search: query.search || undefined,
              ...(listAction
                ? { action: listAction }
                : { status: query.filters['status'] || 'ALL' }),
            },
      )
      .pipe(
        map((response) =>
          pageLookupResult(response, (item) => ({
            id: item.id,
            label: item.orderNumber,
            description: lookupDescription(item.customerAlias, lookupStatusKey(item.status)),
          })),
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
