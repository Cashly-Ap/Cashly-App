import { describe, expect, it } from 'vitest';
import { authorizedDestination } from '@features/platform/auth/routing/authorized-destination';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

function auth(modules: BusinessModule[], superAdmin = false) {
  return {
    hasModulePermission: (module: BusinessModule) => modules.includes(module),
    isSuperAdmin: () => superAdmin,
  };
}

describe('authorizedDestination', () => {
  it('opens the dashboard before other permitted business modules after login', () => {
    expect(authorizedDestination(auth(Object.values(BusinessModule), true))).toBe(
      '/analytics/dashboard',
    );
  });

  it.each([
    [BusinessModule.CONTACTS_CUSTOMERS, '/partners/customers'],
    [BusinessModule.CATALOG_PRODUCTS, '/catalog/products'],
    [BusinessModule.INVENTORY_WAREHOUSES, '/inventory/warehouses'],
    [BusinessModule.PURCHASES, '/procurement/purchases'],
    [BusinessModule.FINANCE_INVOICES, '/finance/billing/invoices'],
    [BusinessModule.DASHBOARD, '/analytics/dashboard'],
  ])('selects an accessible landing page for %s', (module, destination) => {
    expect(authorizedDestination(auth([module]))).toBe(destination);
  });

  it('prefers an accessible page within the requested ERP area', () => {
    expect(
      authorizedDestination(
        auth([BusinessModule.CONTACTS_CUSTOMERS, BusinessModule.INVENTORY_WAREHOUSES]),
        'inventory',
      ),
    ).toBe('/inventory/warehouses');
  });

  it('selects treasury rather than billing when opening the treasury root', () => {
    expect(
      authorizedDestination(
        auth([BusinessModule.FINANCE_INVOICES, BusinessModule.FINANCE_CASH_REGISTER]),
        'finance/treasury',
      ),
    ).toBe('/finance/treasury/cash-register');
  });

  it('requires the inventory permission before offering consolidated inventory reporting', () => {
    expect(authorizedDestination(auth([BusinessModule.FINANCE_INVOICES]), 'analytics')).toBe(
      '/platform/auth/configuration',
    );
  });

  it('returns to warehouses instead of the removed report page', () => {
    expect(
      authorizedDestination(
        auth([BusinessModule.FINANCE_INVOICES, BusinessModule.INVENTORY_WAREHOUSES]),
        'analytics',
      ),
    ).toBe('/inventory/warehouses');
  });

  it('allows a custom role with USERS permission to open users', () => {
    expect(authorizedDestination(auth([BusinessModule.USERS]))).toBe('/platform/users');
  });

  it('allows the users landing page for a super administrator with USERS permission', () => {
    expect(authorizedDestination(auth([BusinessModule.USERS], true), 'platform')).toBe(
      '/platform/users',
    );
  });

  it('offers account configuration when the user has no business module permissions', () => {
    expect(authorizedDestination(auth([]))).toBe('/platform/auth/configuration');
  });
});
