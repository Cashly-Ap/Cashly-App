import { map } from 'rxjs';
import { LookupDefinition } from '@core/layouts/models/lookup-definition.model';
import { ReceivablesApiService } from '@features/finance/treasury/receivables/services/api/receivables-api.service';
import {
  arrayLookupResult,
  lookupDescription,
  pageLookupResult,
} from '@shared/utils/navigation-lookup';

export const RECEIVABLE_LOOKUP: LookupDefinition = {
  route: '/finance/treasury/receivables',
  load: (injector, query) => {
    const api = injector.get(ReceivablesApiService);
    if (query.label === 'Aprobar pago' || query.label === 'Rechazar pago') {
      return api
        .listPendingPayments(query.label === 'Aprobar pago' ? 'APPROVE' : 'REJECT')
        .pipe(
          map((items) =>
            arrayLookupResult(
              items,
              (item) => ({
                id: item.id,
                label: item.paymentNumber,
                description: lookupDescription(
                  item.customerName,
                  item.invoiceNumber,
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
      .searchCustomersWithDebt({
        search: query.search || undefined,
        page: query.page,
        size: query.size,
        action: debtAction,
      })
      .pipe(
        map((response) =>
          pageLookupResult(response, (item) => ({
            id: item.customerId,
            label: item.customerName,
            description: item.customerRif,
          })),
        ),
      );
  },
  filters: () => [],
  recordRoutes: {
    detail: () => ['/finance/treasury/receivables'],
    edit: () => ['/finance/treasury/receivables'],
  },
};
