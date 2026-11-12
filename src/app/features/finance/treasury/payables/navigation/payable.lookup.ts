import { map } from 'rxjs';
import { LookupDefinition } from '@core/layouts/models/lookup-definition.model';
import { PayablesApiService } from '@features/finance/treasury/payables/services/api/payables-api.service';
import {
  arrayLookupResult,
  lookupDescription,
  pageLookupResult,
} from '@shared/utils/navigation-lookup';

export const PAYABLE_LOOKUP: LookupDefinition = {
  route: '/finance/treasury/payables',
  load: (injector, query) => {
    const api = injector.get(PayablesApiService);
    if (query.label === 'Aprobar pago' || query.label === 'Rechazar pago') {
      return api.listPendingPayments(query.label === 'Aprobar pago' ? 'APPROVE' : 'REJECT').pipe(
        map((items) =>
          arrayLookupResult(
            items,
            (item) => ({
              id: item.id,
              label: item.paymentNumber,
              description: lookupDescription(
                item.supplierName,
                item.purchaseNumber,
                item.referenceNumber,
              ),
            }),
            query.search,
            query.page,
            query.size,
          ),
        ),
      );
    }
    const debtAction =
      query.label === 'Pagar todo'
        ? 'PAY_ALL'
        : query.label === 'Pago parcial'
          ? 'PAY_PARTIAL'
          : query.label === 'Reintegro'
            ? 'REFUND'
            : undefined;
    return api
      .searchSuppliersWithDebt({
        search: query.search || undefined,
        page: query.page,
        size: query.size,
        action: debtAction,
      })
      .pipe(
        map((response) =>
          pageLookupResult(response, (item) => ({
            id: item.supplierId,
            label: item.supplierName,
            description: item.supplierRif,
          })),
        ),
      );
  },
  filters: () => [],
  recordRoutes: {
    detail: () => ['/finance/treasury/payables'],
    edit: () => ['/finance/treasury/payables'],
  },
};
