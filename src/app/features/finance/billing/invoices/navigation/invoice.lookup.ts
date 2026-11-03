import { map } from 'rxjs';
import { LookupDefinition } from '@core/layouts/models/lookup-definition.model';
import { InvoiceApiService } from '@features/finance/billing/invoices/services/api/invoice-api.service';
import { InvoiceStatus } from '@features/finance/billing/invoices/models/enums/invoice-status.enum';
import { PaymentType } from '@features/finance/billing/invoices/models/enums/payment-type.enum';
import { documentListAction } from '@shared/models/document-list-action';
import {
  arrayLookupResult,
  lookupDescription,
  lookupStatusKey,
  textLookupFilter,
} from '@shared/utils/navigation-lookup';

const option = (label: string, value: string) => ({ label, value });

const INVOICE_STATUS_OPTIONS = [
  option('navigation.options.allInvoices', 'ALL'),
  option('navigation.options.draft', InvoiceStatus.DRAFT),
  option('navigation.options.pendingPayment', InvoiceStatus.PENDING_PAYMENT),
  option('navigation.options.partiallyPaid', InvoiceStatus.PARTIALLY_PAID),
  option('navigation.options.paid', InvoiceStatus.PAID),
  option('navigation.options.cancelled', InvoiceStatus.CANCELLED),
  option('navigation.options.fullyReturned', InvoiceStatus.FULLY_RETURNED),
];

const PAYMENT_TYPE_OPTIONS = [
  option('navigation.options.allTypes', ''),
  option('navigation.options.cash', PaymentType.CASH),
  option('navigation.options.credit', PaymentType.CREDIT),
];

const DUE_STATUS_OPTIONS = [
  option('navigation.options.allDates', ''),
  option('navigation.options.overdue', 'OVERDUE'),
  option('navigation.options.current', 'CURRENT'),
];

const RETURN_STATUS_OPTIONS = [
  option('navigation.options.all', ''),
  option('navigation.options.noReturn', 'NONE'),
  option('navigation.options.partiallyReturned', 'PARTIAL'),
  option('navigation.options.fullyReturned', 'FULL'),
];

export const INVOICE_LOOKUP: LookupDefinition = {
  route: '/finance/billing/invoices',
  load: (injector, query) => {
    const api = injector.get(InvoiceApiService);
    const action = documentListAction(query.label);
    const listAction = action === 'CANCEL' ? undefined : action;
    const invoiceStatus = textLookupFilter(query.filters['status']);
    const statuses =
      !invoiceStatus || invoiceStatus === 'ALL'
        ? Object.values(InvoiceStatus)
        : [invoiceStatus];
    const returnStatus = textLookupFilter(query.filters['returnStatus']);
    const dueStatus = textLookupFilter(query.filters['dueStatus']);
    return api
      .getAll({
        search: query.search || undefined,
        action: listAction,
        ...(!listAction ? { statuses } : {}),
        paymentType: textLookupFilter(query.filters['paymentType']),
        dueStatus: dueStatus as 'OVERDUE' | 'CURRENT' | undefined,
        returnStatus: returnStatus ? [returnStatus] : undefined,
      })
      .pipe(
        map((items) =>
          arrayLookupResult(
            items,
            (item) => ({
              id: item.id,
              label: item.invoiceNumber,
              description: lookupDescription(item.customerName, lookupStatusKey(item.status)),
            }),
            '',
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
      options: INVOICE_STATUS_OPTIONS,
      defaultValue: 'ALL',
    },
    {
      key: 'paymentType',
      label: 'navigation.filters.paymentType',
      options: PAYMENT_TYPE_OPTIONS,
      defaultValue: '',
    },
    {
      key: 'dueStatus',
      label: 'navigation.filters.dueStatus',
      options: DUE_STATUS_OPTIONS,
      defaultValue: '',
    },
    {
      key: 'returnStatus',
      label: 'navigation.filters.returnStatus',
      options: RETURN_STATUS_OPTIONS,
      defaultValue: '',
    },
  ],
  recordRoutes: {
    detail: (id: string) => ['/finance/billing/invoices', id],
    edit: (id: string) => ['/finance/billing/invoices', id, 'edit'],
  },
};
