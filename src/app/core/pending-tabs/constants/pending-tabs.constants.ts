export const PENDING_TABS_STORAGE_KEY = 'cashly_pending_tabs';

export const PENDING_TABS_CONFIG = {
  DEBOUNCE_TIME: 1000,
  MAX_TABS: 20,
} as const;

export const MODULE_LABELS: Record<string, string> = {
  customers: 'navigation.labels.customers',
  users: 'navigation.labels.users',
  products: 'navigation.labels.products',
  orders: 'navigation.labels.orders',
  quotes: 'navigation.labels.quotes',
  purchases: 'navigation.labels.purchases',
  invoices: 'navigation.labels.invoices',
  warehouses: 'navigation.labels.warehouses',
  categories: 'navigation.labels.categories',
  'price-types': 'navigation.labels.priceTypes',
  'payment-methods': 'navigation.labels.paymentMethods',
  suppliers: 'navigation.labels.suppliers',
  roles: 'navigation.labels.roles',
  departments: 'navigation.labels.departments',
  finances: 'navigation.labels.finance',
  expenses: 'finance.treasury.expenses.expenses',
};
