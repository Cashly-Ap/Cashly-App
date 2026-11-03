import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

const ROUTE_MODULES: ReadonlyArray<readonly [string, BusinessModule]> = [
  ['/platform/users', BusinessModule.USERS],
  ['/platform/roles', BusinessModule.ROLES],
  ['/platform/departments', BusinessModule.DEPARTMENTS],
  ['/catalog/products', BusinessModule.CATALOG_PRODUCTS],
  ['/catalog/categories', BusinessModule.CATALOG_CATEGORIES],
  ['/catalog/price-types', BusinessModule.CATALOG_PRICES],
  ['/inventory/warehouses/stock', BusinessModule.INVENTORY_WAREHOUSES],
  ['/inventory/warehouses/movements', BusinessModule.INVENTORY_WAREHOUSES],
  ['/inventory/warehouses', BusinessModule.INVENTORY_WAREHOUSES],
  ['/sales/quotes', BusinessModule.SALES_QUOTES],
  ['/sales/orders', BusinessModule.SALES_ORDERS],
  ['/partners/customers', BusinessModule.CONTACTS_CUSTOMERS],
  ['/partners/suppliers', BusinessModule.CONTACTS_SUPPLIERS],
  ['/procurement/purchases', BusinessModule.PURCHASES],
  ['/finance/billing/invoices', BusinessModule.FINANCE_INVOICES],
  ['/finance/billing/returns', BusinessModule.FINANCE_RETURNS],
  ['/finance/billing/credit-notes', BusinessModule.FINANCE_CREDIT_NOTES],
  ['/finance/billing/debit-notes', BusinessModule.FINANCE_DEBIT_NOTES],
  ['/finance/treasury/cash-register/history', BusinessModule.FINANCE_CASH_REGISTER],
  ['/finance/treasury/cash-register', BusinessModule.FINANCE_CASH_REGISTER],
  ['/finance/treasury/receivables', BusinessModule.FINANCE_RECEIVABLES],
  ['/finance/treasury/payment-methods', BusinessModule.FINANCE_PAYMENT_METHODS],
  ['/analytics/dashboard', BusinessModule.DASHBOARD],
];

const CUSTOMER_BALANCE_PATTERN = /^\/partners\/customers\/[^/]+\/balance(?:\/|$|\?)/;

export function moduleForUrl(url: string): BusinessModule | null {
  if (CUSTOMER_BALANCE_PATTERN.test(url)) return BusinessModule.CONTACTS_CUSTOMERS;
  const match = ROUTE_MODULES.find(([prefix]) => url.startsWith(prefix));
  return match ? match[1] : null;
}
