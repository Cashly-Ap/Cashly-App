import { expect, test, type Page, type Route } from '@playwright/test';

const appRoutes = [
  { path: '/analytics/dashboard' },
  { path: '/platform/users' },
  { path: '/partners/suppliers' },
  { path: '/procurement/purchases' },
  { path: '/catalog/categories' },
  { path: '/catalog/price-types' },
  { path: '/catalog/products' },
  { path: '/inventory/warehouses' },
  { path: '/sales/orders' },
  { path: '/sales/quotes' },
  { path: '/finance/billing/invoices' },
  { path: '/analytics/reports/inventory' },
  { path: '/finance/treasury/payment-methods' },
  { path: '/finance/billing/credit-notes' },
  { path: '/finance/billing/debit-notes' },
  { path: '/finance/billing/returns' },
  { path: '/finance/treasury/cash-register' },
  { path: '/finance/treasury/cash-register/history' },
  { path: '/finance/treasury/receivables' },
] as const;

const pageResponse = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 10,
  number: 0,
  first: true,
  last: true,
  empty: true,
};

async function authenticate(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('accessToken', 'e2e-access-token');
    localStorage.setItem('refreshToken', 'e2e-refresh-token');
    localStorage.setItem(
      'currentUser',
      JSON.stringify({
        id: 'user-e2e-1',
        email: 'e2e-admin@example.com',
        userName: 'E2E Admin',
        type: 'SUPER_ADMIN',
        role: 'SUPER_ADMIN',
        active: true,
        modulePermissions: [
          'USERS',
          'INVENTORY',
          'SALES',
          'FINANCES',
          'PURCHASES',
          'DOCUMENT_ADMIN',
          'DASHBOARD',
        ],
      }),
    );
  });
}

async function fulfillApi(route: Route): Promise<void> {
  const path = new URL(route.request().url()).pathname;

  if (path.endsWith('/notifications/unread-count')) {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '0' });
    return;
  }

  if (path.includes('/reports/') || path.endsWith('/pdf') || path.endsWith('/excel')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/octet-stream',
      body: 'e2e-report',
    });
    return;
  }

  if (path.endsWith('/dashboard/summary')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ totalSales: 0, totalOrders: 0, totalInvoices: 0, lowStockCount: 0 }),
    });
    return;
  }

  if (path.includes('/dashboard/')) {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    return;
  }

  if (path.endsWith('/cash-register/active')) {
    await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' });
    return;
  }

  if (path.endsWith('/receivables/summary')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ totalDebt: 0, overdueDebt: 0, pendingPayments: 0, customerCount: 0 }),
    });
    return;
  }

  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(pageResponse),
  });
}

for (const moduleRoute of appRoutes) {
  test(`loads ${moduleRoute.path} and reaches its module shell`, async ({ page }) => {
    const apiRequests: string[] = [];
    await authenticate(page);
    await page.route('**/api/**', async (route) => {
      apiRequests.push(new URL(route.request().url()).pathname);
      await fulfillApi(route);
    });

    await page.goto(moduleRoute.path);

    await expect(page).toHaveURL(new RegExp(`${moduleRoute.path.replaceAll('/', '\\/')}$`));
    await expect(page.locator('app-main-layout').first()).toBeVisible();
    await expect.poll(() => apiRequests.length).toBeGreaterThan(0);
  });
}
