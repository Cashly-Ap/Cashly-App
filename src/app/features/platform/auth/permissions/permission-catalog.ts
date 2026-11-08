import { QUOTE_PERMISSIONS } from '@features/sales/quotes/permissions';
import { ORDER_PERMISSIONS } from '@features/sales/orders/permissions';
import { PURCHASE_PERMISSIONS } from '@features/procurement/purchases/permissions';
import { PRODUCT_PERMISSIONS } from '@features/catalog/products/permissions';
import { CATEGORY_PERMISSIONS } from '@features/catalog/categories/permissions';
import { PRICE_TYPE_PERMISSIONS } from '@features/catalog/price-types/permissions';
import { WAREHOUSE_PERMISSIONS } from '@features/inventory/warehouses/permissions';
import { INVOICE_PERMISSIONS } from '@features/finance/billing/invoices/permissions';
import { RETURN_PERMISSIONS } from '@features/finance/billing/returns/permissions';
import { CREDIT_NOTE_PERMISSIONS } from '@features/finance/billing/credit-notes/permissions';
import { DEBIT_NOTE_PERMISSIONS } from '@features/finance/billing/debit-notes/permissions';
import { CASH_REGISTER_PERMISSIONS } from '@features/finance/treasury/cash-register/permissions';
import { RECEIVABLE_PERMISSIONS } from '@features/finance/treasury/receivables/permissions';
import { PAYMENT_METHOD_PERMISSIONS } from '@features/finance/treasury/payment-methods/permissions';
import { CUSTOMER_PERMISSIONS } from '@features/partners/customers/permissions';
import { SUPPLIER_PERMISSIONS } from '@features/partners/suppliers/permissions';
import { DASHBOARD_PERMISSIONS } from '@features/analytics/dashboard/permissions';
import { USER_PERMISSIONS } from '@features/platform/auth/user/permissions';
import { ROLE_PERMISSIONS } from '@features/platform/auth/role/permissions';
import { DEPARTMENT_PERMISSIONS } from '@features/platform/auth/department/permissions';
import { COMPANY_PERMISSIONS } from '@features/platform/company/permissions';

export const PERMISSION_CATALOG = [
  {
    areaKey: 'navigation.labels.sales',
    sections: [
      {
        sectionKey: null,
        modules: [
          { moduleKey: 'navigation.labels.quotes', permissions: QUOTE_PERMISSIONS },
          { moduleKey: 'navigation.labels.orders', permissions: ORDER_PERMISSIONS },
        ],
      },
    ],
  },
  {
    areaKey: 'navigation.labels.purchases',
    sections: [
      {
        sectionKey: null,
        modules: [{ moduleKey: 'navigation.labels.purchases', permissions: PURCHASE_PERMISSIONS }],
      },
    ],
  },
  {
    areaKey: 'navigation.labels.catalog',
    sections: [
      {
        sectionKey: null,
        modules: [
          { moduleKey: 'navigation.labels.products', permissions: PRODUCT_PERMISSIONS },
          { moduleKey: 'navigation.labels.categories', permissions: CATEGORY_PERMISSIONS },
          { moduleKey: 'navigation.labels.priceTypes', permissions: PRICE_TYPE_PERMISSIONS },
        ],
      },
    ],
  },
  {
    areaKey: 'navigation.labels.inventory',
    sections: [
      {
        sectionKey: null,
        modules: [
          { moduleKey: 'navigation.labels.warehouses', permissions: WAREHOUSE_PERMISSIONS },
        ],
      },
    ],
  },
  {
    areaKey: 'navigation.labels.finance',
    sections: [
      {
        sectionKey: 'navigation.labels.billing',
        modules: [
          { moduleKey: 'navigation.labels.invoices', permissions: INVOICE_PERMISSIONS },
          { moduleKey: 'navigation.labels.returns', permissions: RETURN_PERMISSIONS },
          { moduleKey: 'navigation.labels.creditNotes', permissions: CREDIT_NOTE_PERMISSIONS },
          { moduleKey: 'navigation.labels.debitNotes', permissions: DEBIT_NOTE_PERMISSIONS },
        ],
      },
      {
        sectionKey: 'navigation.labels.treasury',
        modules: [
          { moduleKey: 'navigation.labels.cashRegister', permissions: CASH_REGISTER_PERMISSIONS },
          {
            moduleKey: 'navigation.labels.accountsReceivable',
            permissions: RECEIVABLE_PERMISSIONS,
          },
          {
            moduleKey: 'navigation.labels.paymentMethods',
            permissions: PAYMENT_METHOD_PERMISSIONS,
          },
        ],
      },
    ],
  },
  {
    areaKey: 'navigation.labels.contacts',
    sections: [
      {
        sectionKey: null,
        modules: [
          { moduleKey: 'navigation.labels.customers', permissions: CUSTOMER_PERMISSIONS },
          { moduleKey: 'navigation.labels.suppliers', permissions: SUPPLIER_PERMISSIONS },
        ],
      },
    ],
  },
  {
    areaKey: 'navigation.labels.analytics',
    sections: [
      {
        sectionKey: null,
        modules: [{ moduleKey: 'navigation.labels.dashboard', permissions: DASHBOARD_PERMISSIONS }],
      },
    ],
  },
  {
    areaKey: 'navigation.labels.platform',
    sections: [
      {
        sectionKey: null,
        modules: [
          { moduleKey: 'navigation.labels.users', permissions: USER_PERMISSIONS },
          { moduleKey: 'navigation.labels.roles', permissions: ROLE_PERMISSIONS },
          { moduleKey: 'navigation.labels.departments', permissions: DEPARTMENT_PERMISSIONS },
          { moduleKey: 'navigation.labels.company', permissions: COMPANY_PERMISSIONS },
        ],
      },
    ],
  },
] as const;
