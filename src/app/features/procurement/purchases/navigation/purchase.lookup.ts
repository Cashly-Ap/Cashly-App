import { map } from 'rxjs';
import { LookupDefinition } from '@core/layouts/models/lookup-definition.model';
import { PurchaseApiService } from '@features/procurement/purchases/services/api/purchase-api.service';
import { PurchaseStatus } from '@features/procurement/purchases/models/enums/purchase-status.enum';
import { documentListAction } from '@shared/models/document-list-action';
import {
  lookupDescription,
  lookupStatusKey,
  pageLookupResult,
  textLookupFilter,
} from '@shared/utils/navigation-lookup';

const option = (label: string, value: string) => ({ label, value });

const PURCHASE_STATUS_OPTIONS = [
  option('navigation.options.all', ''),
  option('navigation.options.draft', PurchaseStatus.DRAFT),
  option('navigation.options.confirmed', PurchaseStatus.CONFIRMED),
  option('navigation.options.cancelled', PurchaseStatus.CANCELLED),
];

export const PURCHASE_LOOKUP: LookupDefinition = {
  route: '/procurement/purchases',
  load: (injector, query) => {
    const api = injector.get(PurchaseApiService);
    const action = documentListAction(query.label);
    const requestedAction = action === 'DELETE' ? 'DELETE' : undefined;
    const listAction = action === 'CANCEL' ? undefined : action;
    const status = textLookupFilter(query.filters['status']);
    return api
      .getAll({
        page: query.page,
        size: query.size,
        search: query.search || undefined,
        ...(requestedAction
          ? { action: requestedAction }
          : listAction
            ? { action: listAction }
            : status
              ? { status }
              : {}),
      })
      .pipe(
        map((response) =>
          pageLookupResult(response, (item) => ({
            id: item.id,
            label: item.purchaseNumber,
            description: lookupDescription(item.supplierName, lookupStatusKey(item.status)),
          })),
        ),
      );
  },
  filters: () => [
    {
      key: 'status',
      label: 'navigation.filters.status',
      options: PURCHASE_STATUS_OPTIONS,
      defaultValue: '',
    },
  ],
  recordRoutes: {
    detail: (id: string) => ['/procurement/purchases', id],
    edit: (id: string) => ['/procurement/purchases', id, 'edit'],
  },
};
