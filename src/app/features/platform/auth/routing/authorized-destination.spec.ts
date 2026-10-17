import { describe, expect, it } from 'vitest';
import { authorizedDestination } from './authorized-destination';
import { BusinessModule } from '../user/models/enums/business-module.enum';

function auth(modules: BusinessModule[], superAdmin = false) {
  return {
    hasModulePermission: (module: BusinessModule) => modules.includes(module),
    isSuperAdmin: () => superAdmin,
  };
}

describe('authorizedDestination', () => {
  it.each([
    [BusinessModule.SALES, '/partners/customers'],
    [BusinessModule.INVENTORY, '/catalog/products'],
    [BusinessModule.PURCHASES, '/procurement/purchases'],
    [BusinessModule.FINANCE, '/finance/billing/credit-notes'],
    [BusinessModule.DASHBOARD, '/analytics/dashboard'],
  ])('selects an accessible landing page for %s', (module, destination) => {
    expect(authorizedDestination(auth([module]))).toBe(destination);
  });

  it('prefers an accessible page within the requested ERP area', () => {
    expect(
      authorizedDestination(auth([BusinessModule.SALES, BusinessModule.INVENTORY]), 'inventory'),
    ).toBe('/inventory/warehouses');
  });

  it('selects treasury rather than billing when opening the treasury root', () => {
    expect(authorizedDestination(auth([BusinessModule.FINANCE]), 'finance/treasury')).toBe(
      '/finance/treasury/cash-register',
    );
  });

  it('requires the inventory permission before offering consolidated inventory reporting', () => {
    expect(authorizedDestination(auth([BusinessModule.DOCUMENT_ADMIN]), 'analytics')).toBe(
      '/platform/auth/configuration',
    );
  });

  it('allows consolidated reporting when both required permissions exist', () => {
    expect(
      authorizedDestination(
        auth([BusinessModule.DOCUMENT_ADMIN, BusinessModule.INVENTORY]),
        'analytics',
      ),
    ).toBe('/analytics/reports/inventory');
  });

  it('does not send an operator with USERS permission to super administrator pages', () => {
    expect(authorizedDestination(auth([BusinessModule.USERS]))).toBe(
      '/platform/auth/configuration',
    );
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
