import { expect, test, type Page } from '@playwright/test';

const emptyPage = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 10,
  number: 0,
  first: true,
  last: true,
  empty: true,
};

async function waitForImages(page: Page): Promise<void> {
  await page.waitForFunction(() =>
    Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0),
  );
}

async function prepare(
  page: Page,
  theme: 'light' | 'dark',
  authenticated = true,
  populated = false,
): Promise<void> {
  await page.addInitScript(
    ({ theme, authenticated }) => {
      localStorage.setItem('theme', theme);
      if (authenticated) {
        localStorage.setItem('accessToken', 'design-access-token');
        localStorage.setItem('refreshToken', 'design-refresh-token');
        localStorage.setItem(
          'currentUser',
          JSON.stringify({
            id: 'design-user',
            email: 'design@example.com',
            userName: 'Design Admin',
            role: 'SUPER_ADMIN',
            type: 'SUPER_ADMIN',
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
      }
    },
    { theme, authenticated },
  );
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    let body: unknown = emptyPage;
    if (path.endsWith('/notifications/unread-count')) body = 0;
    else if (path.endsWith('/dashboard/summary'))
      body = {
        monthlySales: populated ? 12450 : 0,
        pendingOrders: populated ? 8 : 0,
        overdueReceivables: populated ? 1500 : 0,
        lowStockProducts: populated ? 3 : 0,
      };
    else if (path.endsWith('/dashboard/monthly-sales'))
      body = populated
        ? [
            { month: '2026-08', total: 9000 },
            { month: '2026-09', total: 11000 },
            { month: '2026-10', total: 12450 },
          ]
        : [];
    else if (path.endsWith('/dashboard/top-products') || path.endsWith('/dashboard/top-customers'))
      body = populated
        ? [
            { id: 'top-1', name: 'Cashly Design', total: 4800 },
            { id: 'top-2', name: 'Workspace', total: 2600 },
          ]
        : [];
    else if (path.endsWith('/dashboard/invoice-due-schedule'))
      body = populated
        ? [
            {
              invoiceId: 'invoice-1',
              invoiceNumber: 'INV-001',
              customerId: 'customer-1',
              customerName: 'Design Customer',
              dueDate: '2026-10-10',
              amount: 1500,
            },
          ]
        : [];
    else if (path.endsWith('/dashboard/recent-activity'))
      body = populated
        ? [
            {
              type: 'invoice',
              id: 'activity-1',
              number: 'INV-001',
              customer: 'Design Customer',
              amount: 1500,
              created_at: '2026-10-12T09:00:00Z',
            },
          ]
        : [];
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
}

for (const theme of ['light', 'dark'] as const) {
  for (const viewport of [
    { width: 1920, height: 1080 },
    { width: 390, height: 844 },
  ]) {
    const size = viewport.width === 390 ? 'mobile' : 'desktop';
    test(`dashboard loaded ${size} ${theme} remains inside the viewport`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await prepare(page, theme, true, true);
      await page.goto('/dashboard');
      await page.locator('canvas').last().waitFor();
      await waitForImages(page);
      await page.screenshot({
        path: `output/design/dashboard-${size}-${theme}.png`,
        fullPage: true,
      });
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
        .toBe(true);
    });

    test(`login ${size} ${theme} keeps the existing font family`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await prepare(page, theme, false);
      await page.goto('/auth/login');
      await page.getByRole('heading', { name: 'Bienvenido de nuevo' }).waitFor();
      await page.waitForFunction(() => {
        const logo = document.querySelector<HTMLImageElement>('img[alt="Logo Cashly"]');
        return !!logo && logo.naturalWidth > 0 && logo.getBoundingClientRect().width > 0;
      });
      await waitForImages(page);
      await page.screenshot({ path: `output/design/login-${size}-${theme}.png`, fullPage: true });
      await expect(page.locator('body')).toHaveCSS('font-family', /ui-sans-serif, system-ui/);
    });
  }
}

test('dashboard explains the empty state for every data widget', async ({ page }) => {
  await prepare(page, 'light');
  await page.goto('/dashboard');
  await expect(page.locator('.dashboard-empty')).toHaveText([
    'Sin datos de ventas',
    'Sin datos de productos',
    'No hay facturas pendientes de cobro.',
    'Sin datos de clientes',
    'Sin actividad reciente',
  ]);
});

test('dashboard renders all four charts when data arrives', async ({ page }) => {
  await prepare(page, 'dark', true, true);
  await page.goto('/dashboard');
  await expect(page.locator('canvas')).toHaveCount(4);
});

test('login disables submission while required credentials are empty', async ({ page }) => {
  await prepare(page, 'light', false);
  await page.goto('/auth/login');
  await expect(page.getByRole('button', { name: 'Iniciar Sesión' })).toBeDisabled();
});

test('login links an invalid email to its visible validation message', async ({ page }) => {
  await prepare(page, 'light', false);
  await page.goto('/auth/login');
  await page.getByLabel('Email', { exact: true }).fill('invalid-email');
  await page.getByLabel('Contraseña', { exact: true }).focus();
  await expect(page.getByLabel('Email', { exact: true })).toHaveAccessibleDescription(
    /email|correo/i,
  );
});

test('mobile menu navigates to customers and closes the drawer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepare(page, 'light');
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Menú', exact: true }).click();
  await page
    .locator('.cashly-navigation-drawer')
    .getByText('Ventas', { exact: true })
    .filter({ visible: true })
    .click();
  await page.locator('.cashly-navigation-drawer').getByText('Clientes', { exact: true }).click();
  await expect(page).toHaveURL(/\/customers$/);
});

test('mobile menu closes after choosing a destination', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepare(page, 'dark');
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Menú', exact: true }).click();
  await page.locator('.cashly-navigation-drawer').getByText('Dashboard', { exact: true }).click();
  await expect(page.locator('.cashly-navigation-drawer')).not.toBeVisible();
});

test('login presents the rejected credentials in an accessible notification', async ({ page }) => {
  await prepare(page, 'light', false);
  await page.route('**/api/auth/login', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Credenciales incorrectas' }),
    }),
  );
  await page.goto('/auth/login');
  await page.getByLabel('Email', { exact: true }).fill('design@example.com');
  await page.getByLabel('Contraseña', { exact: true }).fill('WrongPassword1!');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await expect(page.getByText('Credenciales incorrectas')).toBeVisible();
});

test('login shows progress while the authentication request is pending', async ({ page }) => {
  await prepare(page, 'light', false);
  let finishRequest: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    finishRequest = resolve;
  });
  await page.route('**/api/auth/login', async (route) => {
    await pending;
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: '{"message":"Credenciales incorrectas"}',
    });
  });
  await page.goto('/auth/login');
  await page.getByLabel('Email', { exact: true }).fill('design@example.com');
  await page.getByLabel('Contraseña', { exact: true }).fill('ValidPassword1!');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  try {
    await expect(page.locator('.p-button-loading-icon')).toBeVisible();
  } finally {
    finishRequest?.();
  }
});

test('dark theme persists after reloading the dashboard', async ({ page }) => {
  await prepare(page, 'dark');
  await page.goto('/dashboard');
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/my-app-dark/);
});

test('login loads the Cashly logo with a visible image area', async ({ page }) => {
  await prepare(page, 'light', false);
  await page.goto('/auth/login');
  await expect
    .poll(() =>
      page.getByRole('img', { name: 'Logo Cashly' }).evaluate((image) => {
        const logo = image as HTMLImageElement;
        return logo.naturalWidth > 0 && logo.getBoundingClientRect().width > 0;
      }),
    )
    .toBe(true);
});

for (const theme of ['light', 'dark'] as const) {
  test(`customer table ${theme} remains inside the viewport`, async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await prepare(page, theme);
    await page.route('**/api/customers*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...emptyPage,
          totalElements: 1,
          totalPages: 1,
          empty: false,
          content: [
            {
              id: 'customer-design',
              code: 1001,
              alias: 'Design',
              legalName: 'Cashly Design S.A.',
              rif: 'J-12345678-9',
              type: 'BUSINESS',
              active: true,
              deletable: true,
            },
          ],
        }),
      }),
    );
    await page.goto('/customers');
    await page.getByText('Cashly Design S.A.').first().waitFor();
    await waitForImages(page);
    await page.screenshot({ path: `output/design/customers-desktop-${theme}.png`, fullPage: true });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true);
  });
}

test('customer form mobile keeps fields inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await prepare(page, 'light');
  await page.goto('/customers');
  await page.getByRole('button', { name: 'Nuevo Cliente' }).click();
  await page.getByRole('tab', { name: /General/ }).waitFor();
  await waitForImages(page);
  await page.screenshot({ path: 'output/design/customer-form-mobile-light.png', fullPage: true });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});

for (const theme of ['light', 'dark'] as const) {
  test(`shell icon loads with ${theme} contrast`, async ({ page }, testInfo) => {
    await prepare(page, theme);
    await page.goto('/dashboard');
    await waitForImages(page);
    const icon = page.locator('.cashly-brand img');
    const imageState = await icon.evaluate((image) => {
      const logo = image as HTMLImageElement;
      return {
        src: logo.currentSrc,
        naturalWidth: logo.naturalWidth,
        width: logo.getBoundingClientRect().width,
        filter: getComputedStyle(logo).filter,
      };
    });
    await testInfo.attach(`icon-${theme}.json`, {
      body: JSON.stringify(imageState),
      contentType: 'application/json',
    });
    await page.locator('.cashly-brand').screenshot({ path: `output/design/icon-${theme}.png` });
    await expect(icon).toHaveCSS('filter', theme === 'dark' ? 'invert(1)' : 'none');
  });
}
