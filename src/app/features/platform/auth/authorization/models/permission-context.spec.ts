import { describe, expect, it } from 'vitest';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { moduleForUrl } from '@features/platform/auth/authorization/models/permission-context';

describe('moduleForUrl', () => {
  it.each<[string, BusinessModule]>([
    ['/platform/users', BusinessModule.USERS],
    ['/platform/roles', BusinessModule.ROLES],
    ['/platform/departments', BusinessModule.DEPARTMENTS],
    ['/catalog/products', BusinessModule.CATALOG_PRODUCTS],
    ['/catalog/categories', BusinessModule.CATALOG_CATEGORIES],
    ['/catalog/price-types', BusinessModule.CATALOG_PRICES],
    ['/inventory/warehouses', BusinessModule.INVENTORY_WAREHOUSES],
    ['/inventory/warehouses/stock', BusinessModule.INVENTORY_WAREHOUSES],
    ['/inventory/warehouses/movements', BusinessModule.INVENTORY_WAREHOUSES],
    ['/sales/quotes', BusinessModule.SALES_QUOTES],
    ['/sales/quotes/new', BusinessModule.SALES_QUOTES],
    ['/sales/orders', BusinessModule.SALES_ORDERS],
    ['/partners/customers', BusinessModule.CONTACTS_CUSTOMERS],
    ['/partners/customers/123/balance', BusinessModule.CONTACTS_CUSTOMERS],
    ['/partners/suppliers', BusinessModule.CONTACTS_SUPPLIERS],
    ['/procurement/purchases', BusinessModule.PURCHASES],
    ['/sales/invoices', BusinessModule.SALES_INVOICES_INVOICES],
    ['/sales/returns', BusinessModule.SALES_INVOICES_RETURNS],
    ['/sales/credit-notes', BusinessModule.SALES_INVOICES_CREDIT_NOTES],
    ['/sales/debit-notes', BusinessModule.SALES_INVOICES_DEBIT_NOTES],
    ['/finance/treasury/cash-register', BusinessModule.FINANCE_CASH_REGISTER],
    ['/finance/treasury/cash-register/history', BusinessModule.FINANCE_CASH_REGISTER],
    ['/finance/treasury/receivables', BusinessModule.FINANCE_RECEIVABLES],
    ['/finance/treasury/payment-methods', BusinessModule.FINANCE_PAYMENT_METHODS],
    ['/analytics/dashboard', BusinessModule.DASHBOARD],
  ])('maps %s to %s', (url, module) => {
    expect(moduleForUrl(url)).toBe(module);
  });

  it.each(['/', '/unknown', '/platform/auth/profile'])('returns null for %s', (url) => {
    expect(moduleForUrl(url)).toBeNull();
  });

  it('returns a business module for every list route', () => {
    const modules = Object.values(BusinessModule);
    const listRoutes = [
      '/sales/quotes',
      '/sales/orders',
      '/partners/customers',
      '/partners/suppliers',
      '/procurement/purchases',
      '/catalog/products',
      '/catalog/categories',
      '/catalog/price-types',
      '/inventory/warehouses',
      '/sales/invoices',
      '/sales/returns',
      '/sales/credit-notes',
      '/sales/debit-notes',
      '/finance/treasury/cash-register',
      '/finance/treasury/receivables',
      '/finance/treasury/payment-methods',
    ];
    for (const route of listRoutes) {
      expect(modules).toContain(moduleForUrl(route));
    }
  });
});
