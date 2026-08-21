import { expect, test } from '@playwright/test';

const customers = [
  {
    id: 'customer-e2e-1',
    code: 1001,
    alias: 'Global',
    legalName: 'Inversiones Global S.A.',
    rif: 'J-12345678-9',
    type: 'BUSINESS',
    active: true,
    portalAccess: true,
    deletable: true,
  },
  {
    id: 'customer-e2e-2',
    code: 1002,
    alias: 'Servicios',
    legalName: 'Servicios del Centro C.A.',
    rif: 'J-98765432-1',
    type: 'BUSINESS',
    active: true,
    portalAccess: false,
    deletable: false,
  },
];

const pageResponse = (content: typeof customers) => ({
  content,
  totalElements: content.length,
  totalPages: content.length ? 1 : 0,
  size: 10,
  number: 0,
  first: true,
  last: true,
  empty: content.length === 0,
});

async function authenticate(page: import('@playwright/test').Page): Promise<void> {
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
        modulePermissions: ['SALES', 'FINANCES', 'INVENTORY', 'PURCHASES', 'DASHBOARD'],
      }),
    );
  });
}

test.describe('Customers module', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
    await page.route('**/api/notifications/unread-count', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(0) });
    });
    await page.route('**/api/customers*', async (route) => {
      const url = new URL(route.request().url());
      const search = (url.searchParams.get('search') ?? '').toLowerCase();
      const content = search
        ? customers.filter((customer) => customer.legalName.toLowerCase().includes(search))
        : customers;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(pageResponse(content)),
      });
    });
  });

  test('loads the customer list and displays customer status', async ({ page }) => {
    await page.goto('/customers');

    await expect(page).toHaveTitle('Clientes');
    await expect(page.getByRole('heading', { name: 'Clientes' })).toBeVisible();
    await expect(page.getByText('Inversiones Global S.A.').first()).toBeVisible();
    await expect(page.getByText('Servicios del Centro C.A.').first()).toBeVisible();
    await expect(page.getByText('Activo').first()).toBeVisible();
    await expect(page.getByText('Sin acceso').first()).toBeVisible();
  });

  test('filters customers by legal name and sends the search query', async ({ page }) => {
    let requestUrl = '';
    await page.route('**/api/customers*', async (route) => {
      requestUrl = route.request().url();
      const url = new URL(requestUrl);
      const search = (url.searchParams.get('search') ?? '').toLowerCase();
      const content = customers.filter((customer) => customer.legalName.toLowerCase().includes(search));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(pageResponse(content)),
      });
    });

    await page.goto('/customers');
    const search = page.locator('input[placeholder="Buscar por nombre, alias o RIF..."]').first();
    await search.fill('Global');
    await search.press('Enter');

    await expect(page.getByText('Inversiones Global S.A.').first()).toBeVisible();
    await expect(page.getByText('Servicios del Centro C.A.')).toHaveCount(0);
    await expect.poll(() => new URL(requestUrl || 'http://localhost').searchParams.get('search')).toBe(
      'Global',
    );
  });

  test('navigates to the new customer form and keeps submit disabled until required data exists', async ({ page }) => {
    await page.route('**/api/warehouses*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ content: [{ id: 'warehouse-e2e-1', name: 'Main Warehouse' }] }),
      });
    });
    await page.route('**/api/price-types*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          content: [{ id: 'price-type-e2e-1', name: 'Standard', active: true }],
          totalElements: 1,
          totalPages: 1,
          size: 1000,
          number: 0,
          first: true,
          last: true,
          empty: false,
        }),
      });
    });

    await page.goto('/customers');
    await page.getByRole('button', { name: 'Nuevo Cliente' }).click();

    await expect(page).toHaveURL(/\/customers\/new$/);
    await expect(page.getByText('Nuevo Cliente')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Crear Cliente' })).toBeDisabled();
  });
});
