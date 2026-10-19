import { currentAccessFixture } from './access.fixture';
import { expect, test } from '@playwright/test';

test.describe('Back-office authentication entry point', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/access', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(currentAccessFixture()),
      }),
    );
  });
  const authenticatedUser = {
    id: 'user-e2e-1',
    email: 'e2e-admin@example.com',
    userName: 'E2E Admin',
    type: 'SUPER_ADMIN',
    role: 'SUPER_ADMIN',
    active: true,
    createdAt: '2026-08-21T00:00:00Z',
    modulePermissions: ['SALES', 'FINANCES', 'INVENTORY', 'PURCHASES', 'DASHBOARD'],
  };

  test('renders the login form for an unauthenticated visitor', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/platform\/auth\/login$/);
    await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar Sesión' })).toBeDisabled();
  });

  test('redirects protected routes to the login page without a session', async ({ page }) => {
    await page.goto('/analytics/dashboard');

    await expect(page).toHaveURL(/\/platform\/auth\/login$/);
    await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
  });

  test('logs in and persists the authenticated user', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      expect(route.request().method()).toBe('POST');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'e2e-access-token',
          refreshToken: 'e2e-refresh-token',
          tokenType: 'Bearer',
          expiresIn: 3_600_000,
          entity: authenticatedUser,
        }),
      });
    });
    await page.route('**/api/notifications/unread-count', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(0),
      });
    });
    await page.route('**/api/dashboard/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          new URL(route.request().url()).pathname.endsWith('/summary')
            ? { monthlySales: 0, pendingOrders: 0, overdueReceivables: 0, lowStockProducts: 0 }
            : [],
        ),
      });
    });

    await page.goto('/platform/auth/login');
    await page.getByLabel('Email').fill('e2e-admin@example.com');
    await page.locator('input[type="password"]').fill('ValidPassword1!');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page).toHaveURL(/\/analytics\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
    await expect(page.evaluate(() => localStorage.getItem('accessToken'))).resolves.toBe(
      'e2e-access-token',
    );
    await expect(
      page.evaluate(() => JSON.parse(localStorage.getItem('currentUser') ?? '{}')),
    ).resolves.toMatchObject({
      email: 'e2e-admin@example.com',
      role: 'SUPER_ADMIN',
    });
  });

  test('shows the API error when credentials are rejected', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Credenciales incorrectas' }),
      });
    });

    await page.goto('/platform/auth/login');
    await page.getByLabel('Email').fill('e2e-admin@example.com');
    await page.locator('input[type="password"]').fill('WrongPassword1!');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page).toHaveURL(/\/platform\/auth\/login$/);
    await expect(page.getByText('Credenciales incorrectas')).toBeVisible();
    await expect(page.evaluate(() => localStorage.getItem('accessToken'))).resolves.toBeNull();
  });
});
