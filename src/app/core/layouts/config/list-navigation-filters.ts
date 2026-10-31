import { CustomerType } from '@features/partners/customers/models/enums/customer-type.enum';
import {
  getMunicipalitiesForState,
  VENEZUELA_STATE_NAMES,
} from '@features/partners/customers/data/venezuela-geo.data';
import { SupplierType } from '@features/partners/suppliers/models/enums/supplier-type.enum';
import { QuoteStatus } from '@features/sales/quotes/models/enums/quote-status.enum';
import { OrderStatus } from '@features/sales/orders/models/enums/order-status.enum';
import { PurchaseStatus } from '@features/procurement/purchases/models/enums/purchase-status.enum';
import { InvoiceStatus } from '@features/finance/billing/invoices/models/enums/invoice-status.enum';
import { PaymentType } from '@features/finance/billing/invoices/models/enums/payment-type.enum';

export interface LookupFilterOption {
  label: string;
  value: string;
}

export interface LookupFilterDefinition {
  key: string;
  label: string;
  options: readonly LookupFilterOption[];
  defaultValue: string;
}

export interface LookupFilterValueMap {
  readonly [key: string]: string;
}

export interface LookupFilterSources {
  values: LookupFilterValueMap;
  categories: readonly LookupFilterOption[];
  roles: readonly LookupFilterOption[];
}

const option = (label: string, value: string): LookupFilterOption => ({ label, value });

const ALL = option('navigation.options.all', '');
const ALL_TYPES = option('navigation.options.allTypes', '');
const ACTIVE_OPTIONS: readonly LookupFilterOption[] = [
  option('navigation.options.active', 'true'),
  option('navigation.options.inactive', 'false'),
];

const STATUS_OPTIONS: Record<string, readonly LookupFilterOption[]> = {
  '/sales/quotes': [
    ALL,
    option('navigation.options.draft', QuoteStatus.DRAFT),
    option('navigation.options.convertedToOrder', QuoteStatus.CONVERTED_TO_ORDER),
    option('navigation.options.convertedToInvoice', QuoteStatus.CONVERTED_TO_INVOICE),
    option('navigation.options.cancelled', QuoteStatus.CANCELLED),
  ],
  '/sales/orders': [
    ALL,
    option('navigation.options.draft', OrderStatus.DRAFT),
    option('navigation.options.confirmed', OrderStatus.CONFIRMED),
    option('navigation.options.cancelled', OrderStatus.CANCELLED),
    option('navigation.options.invoiced', OrderStatus.INVOICED),
  ],
  '/procurement/purchases': [
    ALL,
    option('navigation.options.draft', PurchaseStatus.DRAFT),
    option('navigation.options.confirmed', PurchaseStatus.CONFIRMED),
    option('navigation.options.cancelled', PurchaseStatus.CANCELLED),
  ],
  '/finance/billing/invoices': [
    option('navigation.options.allInvoices', 'ALL'),
    option('navigation.options.draft', InvoiceStatus.DRAFT),
    option('navigation.options.pendingPayment', InvoiceStatus.PENDING_PAYMENT),
    option('navigation.options.partiallyPaid', InvoiceStatus.PARTIALLY_PAID),
    option('navigation.options.paid', InvoiceStatus.PAID),
    option('navigation.options.cancelled', InvoiceStatus.CANCELLED),
    option('navigation.options.fullyReturned', InvoiceStatus.FULLY_RETURNED),
  ],
};

const PAYMENT_TYPE_OPTIONS: readonly LookupFilterOption[] = [
  ALL_TYPES,
  option('navigation.options.cash', PaymentType.CASH),
  option('navigation.options.credit', PaymentType.CREDIT),
];

const DUE_STATUS_OPTIONS: readonly LookupFilterOption[] = [
  option('navigation.options.allDates', ''),
  option('navigation.options.overdue', 'OVERDUE'),
  option('navigation.options.current', 'CURRENT'),
];

const RETURN_STATUS_OPTIONS: readonly LookupFilterOption[] = [
  option('navigation.options.all', ''),
  option('navigation.options.noReturn', 'NONE'),
  option('navigation.options.partiallyReturned', 'PARTIAL'),
  option('navigation.options.fullyReturned', 'FULL'),
];

const CUSTOMER_TYPE_OPTIONS: readonly LookupFilterOption[] = [
  ALL_TYPES,
  option('navigation.options.customerIndividual', CustomerType.INDIVIDUAL),
  option('navigation.options.customerBusiness', CustomerType.BUSINESS),
  option('navigation.options.customerGovernment', CustomerType.GOVERNMENT),
  option('navigation.options.customerOther', CustomerType.NON_PROFIT),
];

const SUPPLIER_TYPE_OPTIONS: readonly LookupFilterOption[] = [
  ALL_TYPES,
  option('navigation.options.supplierNatural', SupplierType.NATURAL),
  option('navigation.options.supplierLegal', SupplierType.JURIDICO),
];

const COMPOSITE_OPTIONS: readonly LookupFilterOption[] = [
  option('navigation.options.all', ''),
  option('navigation.options.simple', 'false'),
  option('navigation.options.composite', 'true'),
];

const stateOptions = (): readonly LookupFilterOption[] => [
  option('navigation.options.allStates', ''),
  ...VENEZUELA_STATE_NAMES.map((state) => option(state, state)),
];

const municipalityOptions = (values: LookupFilterValueMap): readonly LookupFilterOption[] => {
  const state = values['state'];
  if (!state) return [option('navigation.options.allMunicipalities', '')];
  return [
    option('navigation.options.allMunicipalities', ''),
    ...getMunicipalitiesForState(state).map((municipality) => option(municipality, municipality)),
  ];
};

const ACTIVE_FILTER: LookupFilterDefinition = {
  key: 'active',
  label: 'navigation.filters.active',
  options: ACTIVE_OPTIONS,
  defaultValue: 'true',
};

export function lookupFilterDefaults(route: string): LookupFilterValueMap {
  const defaults: Record<string, string> = {};
  for (const definition of lookupFilterDefinitions(route, {
    values: {},
    categories: [],
    roles: [],
  })) {
    defaults[definition.key] = definition.defaultValue;
  }
  return defaults;
}

export function lookupFilterDefinitions(
  route: string,
  sources: LookupFilterSources,
): readonly LookupFilterDefinition[] {
  const status = STATUS_OPTIONS[route];
  switch (route) {
    case '/sales/quotes':
    case '/sales/orders':
    case '/procurement/purchases':
      return status
        ? [{ key: 'status', label: 'navigation.filters.status', options: status, defaultValue: '' }]
        : [];
    case '/finance/billing/invoices':
      return [
        {
          key: 'status',
          label: 'navigation.filters.status',
          options: status ?? [],
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
      ];
    case '/catalog/products':
      return [
        ACTIVE_FILTER,
        {
          key: 'composite',
          label: 'navigation.filters.composite',
          options: COMPOSITE_OPTIONS,
          defaultValue: '',
        },
        {
          key: 'categoryId',
          label: 'navigation.filters.category',
          options: [
            option('navigation.options.allCategories', ''),
            ...sources.categories,
          ],
          defaultValue: '',
        },
      ];
    case '/catalog/categories':
    case '/catalog/price-types':
    case '/inventory/warehouses':
    case '/finance/treasury/payment-methods':
      return [ACTIVE_FILTER];
    case '/partners/customers':
      return [
        {
          key: 'type',
          label: 'navigation.filters.type',
          options: CUSTOMER_TYPE_OPTIONS,
          defaultValue: '',
        },
        ACTIVE_FILTER,
        {
          key: 'state',
          label: 'navigation.filters.state',
          options: stateOptions(),
          defaultValue: '',
        },
        {
          key: 'municipality',
          label: 'navigation.filters.municipality',
          options: municipalityOptions(sources.values),
          defaultValue: '',
        },
      ];
    case '/partners/suppliers':
      return [
        {
          key: 'type',
          label: 'navigation.filters.type',
          options: SUPPLIER_TYPE_OPTIONS,
          defaultValue: '',
        },
        ACTIVE_FILTER,
        {
          key: 'state',
          label: 'navigation.filters.state',
          options: stateOptions(),
          defaultValue: '',
        },
        {
          key: 'municipality',
          label: 'navigation.filters.municipality',
          options: municipalityOptions(sources.values),
          defaultValue: '',
        },
      ];
    case '/platform/users':
      return [
        ACTIVE_FILTER,
        {
          key: 'role',
          label: 'navigation.filters.role',
          options: [option('navigation.options.allRoles', ''), ...sources.roles],
          defaultValue: '',
        },
      ];
    default:
      return [];
  }
}
