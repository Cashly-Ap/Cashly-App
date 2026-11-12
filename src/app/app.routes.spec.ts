import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '@app/app.routes';

@Component({ template: '', standalone: true })
class DestinationPage {}

const aliases = [
  ['quotes', 'sales/quotes'],
  ['orders', 'sales/orders'],
  ['purchases', 'procurement/purchases'],
  ['products', 'catalog/products'],
  ['categories', 'catalog/categories'],
  ['price-types', 'catalog/price-types'],
  ['warehouses', 'inventory/warehouses'],
  ['invoices', 'finance/billing/invoices'],
  ['returns', 'finance/billing/returns'],
  ['credit-notes', 'finance/billing/credit-notes'],
  ['debit-notes', 'finance/billing/debit-notes'],
  ['cash-register', 'finance/treasury/cash-register'],
  ['receivables', 'finance/treasury/receivables'],
  ['payables', 'finance/treasury/payables'],
  ['payment-methods', 'finance/treasury/payment-methods'],
  ['customers', 'partners/customers'],
  ['suppliers', 'partners/suppliers'],
  ['dashboard', 'analytics/dashboard'],
  ['users', 'platform/users'],
  ['auth', 'platform/auth'],
] as const;

async function createHarness(destination: string): Promise<RouterTestingHarness> {
  const redirects = routes.filter((route) => route.matcher);
  const destinations: Routes = [
    { path: destination + '/:id/edit', component: DestinationPage },
    { path: destination + '/history', component: DestinationPage },
    { path: destination + '/inventory', component: DestinationPage },
    { path: destination + '/login', component: DestinationPage },
    { path: destination, component: DestinationPage },
  ];
  TestBed.configureTestingModule({ providers: [provideRouter([...redirects, ...destinations])] });
  return RouterTestingHarness.create();
}

describe('Legacy ERP route redirects', () => {
  it.each(aliases)('redirects /%s to /%s', async (legacy, canonical) => {
    const harness = await createHarness(canonical);
    await harness.navigateByUrl('/' + legacy, DestinationPage);
    expect(TestBed.inject(Router).url).toBe('/' + canonical);
  });

  it('preserves document IDs, edit suffixes, repeated filters and fragments', async () => {
    const harness = await createHarness('sales/quotes');
    await harness.navigateByUrl(
      '/quotes/quote-1/edit?status=DRAFT&status=SENT&page=2#lines',
      DestinationPage,
    );
    expect(TestBed.inject(Router).url).toBe(
      '/sales/quotes/quote-1/edit?status=DRAFT&status=SENT&page=2#lines',
    );
  });

  it('preserves matrix parameters on nested segments', async () => {
    const harness = await createHarness('inventory/warehouses');
    await harness.navigateByUrl(
      '/warehouses/warehouse-1;tab=stock/edit?active=true#stock',
      DestinationPage,
    );
    expect(TestBed.inject(Router).url).toBe(
      '/inventory/warehouses/warehouse-1;tab=stock/edit?active=true#stock',
    );
  });

  it('preserves matrix parameters from the former module root', async () => {
    const harness = await createHarness('sales/orders');
    await harness.navigateByUrl('/orders;view=compact/order-1;mode=edit/edit', DestinationPage);
    expect(TestBed.inject(Router).url).toBe('/sales/orders;view=compact/order-1;mode=edit/edit');
  });

  it.each([
    [
      '/cash-register/history?closed=true#sessions',
      '/finance/treasury/cash-register/history?closed=true#sessions',
      'finance/treasury/cash-register',
    ],

    [
      '/auth/login?returnUrl=%2Fquotes#login',
      '/platform/auth/login?returnUrl=%2Fquotes#login',
      'platform/auth',
    ],
  ])('preserves nested legacy destination %s', async (legacy, canonical, destination) => {
    const harness = await createHarness(destination);
    await harness.navigateByUrl(legacy, DestinationPage);
    expect(TestBed.inject(Router).url).toBe(canonical);
  });
});

describe('application shell routes', () => {
  it('keeps public authentication outside the persistent application shell', () => {
    const publicAuth = routes.find((route) => route.path === 'platform/auth');
    const shell = routes.find((route) => route.path === '' && route.children);
    expect(publicAuth?.loadChildren).toBeDefined();
    expect(shell?.loadComponent).toBeDefined();
    expect(
      shell?.children
        ?.find((route) => route.path === 'analytics')
        ?.children?.some((route) => route.path === 'dashboard'),
    ).toBe(true);
    expect(
      shell?.children
        ?.find((route) => route.path === 'platform')
        ?.children?.some((route) => route.path === 'users'),
    ).toBe(true);
  });

  it('loads the main layout lazily only for authenticated screens', async () => {
    const shell = routes.find((route) => route.path === '' && route.children);
    const component = await shell?.loadComponent?.();
    expect(component?.name).toBe('MainLayoutComponent');
  });
});
