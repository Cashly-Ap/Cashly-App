export interface NotificationReferenceLocation {
  areaKey: string;
  sectionKey: string | null;
  moduleKey: string;
}

export const NOTIFICATION_REFERENCE_CATALOG: Readonly<
  Record<string, NotificationReferenceLocation>
> = {
  QUOTE: {
    areaKey: 'navigation.labels.sales',
    sectionKey: null,
    moduleKey: 'navigation.labels.quotes',
  },
  ORDER: {
    areaKey: 'navigation.labels.sales',
    sectionKey: null,
    moduleKey: 'navigation.labels.orders',
  },
  PURCHASE: {
    areaKey: 'navigation.labels.purchases',
    sectionKey: null,
    moduleKey: 'navigation.labels.purchases',
  },
  PRODUCT: {
    areaKey: 'navigation.labels.catalog',
    sectionKey: null,
    moduleKey: 'navigation.labels.products',
  },
  CATEGORY: {
    areaKey: 'navigation.labels.catalog',
    sectionKey: null,
    moduleKey: 'navigation.labels.categories',
  },
  PRICE_TYPE: {
    areaKey: 'navigation.labels.catalog',
    sectionKey: null,
    moduleKey: 'navigation.labels.priceTypes',
  },
  WAREHOUSE: {
    areaKey: 'navigation.labels.inventory',
    sectionKey: null,
    moduleKey: 'navigation.labels.warehouses',
  },
  INVOICE: {
    areaKey: 'navigation.labels.finance',
    sectionKey: 'navigation.labels.billing',
    moduleKey: 'navigation.labels.invoices',
  },
  RETURN: {
    areaKey: 'navigation.labels.finance',
    sectionKey: 'navigation.labels.billing',
    moduleKey: 'navigation.labels.returns',
  },
  CREDIT_NOTE: {
    areaKey: 'navigation.labels.finance',
    sectionKey: 'navigation.labels.billing',
    moduleKey: 'navigation.labels.creditNotes',
  },
  DEBIT_NOTE: {
    areaKey: 'navigation.labels.finance',
    sectionKey: 'navigation.labels.billing',
    moduleKey: 'navigation.labels.debitNotes',
  },
  CASH_REGISTER: {
    areaKey: 'navigation.labels.finance',
    sectionKey: 'navigation.labels.treasury',
    moduleKey: 'navigation.labels.cashRegister',
  },
  RECEIVABLE: {
    areaKey: 'navigation.labels.finance',
    sectionKey: 'navigation.labels.treasury',
    moduleKey: 'navigation.labels.accountsReceivable',
  },
  PAYMENT: {
    areaKey: 'navigation.labels.finance',
    sectionKey: 'navigation.labels.treasury',
    moduleKey: 'navigation.labels.accountsReceivable',
  },
  PAYMENT_METHOD: {
    areaKey: 'navigation.labels.finance',
    sectionKey: 'navigation.labels.treasury',
    moduleKey: 'navigation.labels.paymentMethods',
  },
  CUSTOMER: {
    areaKey: 'navigation.labels.contacts',
    sectionKey: null,
    moduleKey: 'navigation.labels.customers',
  },
  SUPPLIER: {
    areaKey: 'navigation.labels.contacts',
    sectionKey: null,
    moduleKey: 'navigation.labels.suppliers',
  },
  USER: {
    areaKey: 'navigation.labels.platform',
    sectionKey: null,
    moduleKey: 'navigation.labels.users',
  },
  ROLE: {
    areaKey: 'navigation.labels.platform',
    sectionKey: null,
    moduleKey: 'navigation.labels.roles',
  },
  DEPARTMENT: {
    areaKey: 'navigation.labels.platform',
    sectionKey: null,
    moduleKey: 'navigation.labels.departments',
  },
  COMPANY: {
    areaKey: 'navigation.labels.platform',
    sectionKey: null,
    moduleKey: 'navigation.labels.company',
  },
};

export function getNotificationReference(
  referenceType: string | null,
): NotificationReferenceLocation | null {
  return referenceType ? (NOTIFICATION_REFERENCE_CATALOG[referenceType] ?? null) : null;
}
