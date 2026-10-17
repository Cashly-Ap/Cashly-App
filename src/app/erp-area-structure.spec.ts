import { routes } from '@app/app.routes';
import { Route, Routes } from '@angular/router';
import { describe, expect, it } from 'vitest';

const featureSources = Object.keys(import.meta.glob('./features/**/*.ts'));
const modulePaths = [
  'sales/quotes',
  'sales/orders',
  'procurement/purchases',
  'catalog/products',
  'catalog/categories',
  'catalog/price-types',
  'inventory/warehouses',
  'finance/billing/invoices',
  'finance/billing/returns',
  'finance/billing/credit-notes',
  'finance/billing/debit-notes',
  'finance/treasury/payments',
  'finance/treasury/cash-register',
  'finance/treasury/receivables',
  'finance/treasury/payment-methods',
  'partners/customers',
  'partners/suppliers',
  'analytics/dashboard',
  'analytics/reporting',
  'platform/auth',
  'platform/notifications',
];
const publicScreens = [
  'auth',
  'dashboard',
  'users',
  'customers',
  'suppliers',
  'purchases',
  'categories',
  'price-types',
  'products',
  'warehouses',
  'orders',
  'quotes',
  'invoices',
  'reports',
  'payment-methods',
  'credit-notes',
  'debit-notes',
  'returns',
  'cash-register',
  'receivables',
];
const shell = routes.find((route) => route.path === '' && route.children)!;

function approvedFeature(path: string): boolean {
  return modulePaths.some((module) => path.startsWith(`./features/${module}/`));
}

async function resolveDeferredPages(route: Route): Promise<void> {
  if (route.loadComponent) {
    const component = await route.loadComponent();
    const resolved =
      typeof component === 'object' && component && 'default' in component
        ? component.default
        : component;
    expect(typeof resolved).toBe('function');
  }
  if (route.loadChildren) {
    const children = (await route.loadChildren()) as Routes;
    expect(Array.isArray(children)).toBe(true);
    for (const child of children) await resolveDeferredPages(child);
  }
  for (const child of route.children ?? []) await resolveDeferredPages(child);
}

describe('ERP business areas', () => {
  it('keeps every feature source and its colocated specs under a declared business owner', () => {
    expect(featureSources.filter((path) => !approvedFeature(path))).toEqual([]);
  });

  it('retains real production files for every declared module', () => {
    expect(
      modulePaths.filter(
        (module) =>
          !featureSources.some(
            (path) => path.startsWith(`./features/${module}/`) && !path.endsWith('.spec.ts'),
          ),
      ),
    ).toEqual([]);
  });

  it('keeps returns in billing and reports inside their business owners', () => {
    expect(
      featureSources.filter((path) => /\/features\/(reports|sales\/returns)\//.test(path)),
    ).toEqual([]);
  });

  it('keeps relocated unit specs next to the files they exercise', () => {
    const integrationSuite = './features/platform/auth/tests/manual-integration.spec.ts';
    expect(
      featureSources
        .filter((path) => path.endsWith('.spec.ts') && path !== integrationSuite)
        .filter((path) => !featureSources.includes(path.replace(/\.spec\.ts$/, '.ts'))),
    ).toEqual([]);
  });

  it('retains report implementations under the owner of their business information', () => {
    const reports = [
      'sales/quotes/reporting/services/api/quote-pdf-api.service.ts',
      'sales/orders/reporting/services/api/order-pdf-api.service.ts',
      'procurement/purchases/reporting/services/api/purchase-pdf-api.service.ts',
      'finance/billing/invoices/reporting/services/api/invoice-pdf-api.service.ts',
      'catalog/products/reporting/services/api/catalog-api.service.ts',
      'inventory/warehouses/reporting/services/api/stock-excel-api.service.ts',
      'inventory/warehouses/reporting/services/api/movements-pdf-api.service.ts',
      'finance/treasury/payments/reporting/services/api/payment-pdf-api.service.ts',
      'finance/treasury/receivables/reporting/services/api/receivables-pdf-api.service.ts',
      'finance/treasury/cash-register/reporting/components/cash-register-report-modal/cash-register-report-modal.component.ts',
    ];
    expect(reports.filter((path) => !featureSources.includes(`./features/${path}`))).toEqual([]);
  });

  it('preserves the public screen URLs despite changing the feature directories', () => {
    expect(shell.children!.map((route) => route.path).sort()).toEqual([...publicScreens].sort());
  });

  it.each(publicScreens)('resolves the complete lazy route tree for /%s', async (path) => {
    await resolveDeferredPages(shell.children!.find((route) => route.path === path)!);
  });

  it('preserves the public login route outside the authenticated shell', async () => {
    await resolveDeferredPages(routes.find((route) => route.path === 'auth')!);
  });
});
