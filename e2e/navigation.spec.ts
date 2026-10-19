import {
  currentAccessFixture,
  referenceOptions,
  departmentReferenceOptions,
} from './access.fixture';
import { expect, test, type Page } from '@playwright/test';

const allModules = [
  'DASHBOARD',
  'SALES',
  'PURCHASES',
  'INVENTORY',
  'FINANCES',
  'DOCUMENT_ADMIN',
  'USERS',
  'ROLES',
  'DEPARTMENTS',
  'CATALOG',
];
const rootLabels = [
  'Ventas',
  'Compras',
  'Catálogo',
  'Inventario',
  'Finanzas',
  'Contactos',
  'Análisis',
  'Plataforma',
];
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

async function authenticate(page: Page, modules = allModules, role = 'SUPER_ADMIN'): Promise<void> {
  await page.addInitScript(
    ({ modules, role }) => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('accessToken', 'navigation-access-token');
      localStorage.setItem('refreshToken', 'navigation-refresh-token');
      localStorage.setItem(
        'currentUser',
        JSON.stringify({
          id: 'navigation-user',
          email: 'navigation@example.com',
          userName: 'Navigation Admin',
          role,
          type: role,
          active: true,
          modulePermissions: modules,
        }),
      );
    },
    { modules, role },
  );
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    let body: unknown = emptyPage;
    if (path.endsWith('/auth/access')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(currentAccessFixture(modules, role === 'SUPER_ADMIN')),
      });
      return;
    }
    if (/\/(roles|departments)\/options$/.test(path)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          path.includes('/departments') ? departmentReferenceOptions : referenceOptions,
        ),
      });
      return;
    }
    if (path.endsWith('/notifications/unread-count')) body = 0;
    else if (path.endsWith('/cash-register/active')) body = null;
    else if (path.endsWith('/dashboard/summary'))
      body = {
        monthlySales: 0,
        pendingOrders: 0,
        overdueReceivables: 0,
        lowStockProducts: 0,
      };
    else if (path.includes('/dashboard/')) body = [];
    else if (path.endsWith('/receivables/summary'))
      body = {
        totalDebt: 0,
        overdueDebt: 0,
        pendingPayments: 0,
        customerCount: 0,
      };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
}

async function openDesktop(page: Page, labels: readonly string[]): Promise<void> {
  let menu = page.locator('p-menubar .p-menubar-root-list');
  for (const [index, label] of labels.entries()) {
    const item = menu
      .locator(':scope > li > .p-menubar-item-content')
      .getByText(label, { exact: true });
    const entry = item.locator('xpath=ancestor::li[1]');
    const submenu = await entry.getAttribute('aria-haspopup');
    if (index > 0 && submenu) {
      await item.hover();
    } else {
      await item.click();
    }
    if (submenu) menu = entry.getByRole('menubar').first();
  }
}

async function openMobile(page: Page, labels: readonly string[]): Promise<void> {
  await page.getByRole('button', { name: 'Menú', exact: true }).click();
  const drawer = page.locator('.cashly-navigation-drawer');
  for (const [index, label] of labels.entries()) {
    const item =
      index === 0
        ? drawer.getByRole('button', { name: label, exact: true })
        : drawer.getByRole('treeitem', { name: label, exact: true });
    await drawer.evaluate(async (element) => {
      await Promise.all(
        element
          .getAnimations({ subtree: true })
          .map((animation) => animation.finished.catch(() => undefined)),
      );
    });
    const target = index === 0 ? item : item.getByText(label, { exact: true });
    await target.scrollIntoViewIfNeeded();
    await expect(target).toBeInViewport({ ratio: 1 });
    await target.click();
  }
}

test('given a super administrator when navigation loads then ERP root groups follow business order', async ({
  page,
}) => {
  await authenticate(page);
  await page.goto('/analytics/dashboard');
  await expect(
    page.locator('.p-menubar-root-list > li > .p-menubar-item-content .p-menubar-item-label'),
  ).toHaveText(rootLabels);
});

const destinations = [
  {
    labels: ['Ventas', 'Presupuestos'],
    path: '/sales/quotes',
  },
  {
    labels: ['Ventas', 'Pedidos'],
    path: '/sales/orders',
  },
  {
    labels: ['Compras', 'Compras'],
    path: '/procurement/purchases',
  },
  {
    labels: ['Catálogo', 'Productos'],
    path: '/catalog/products',
  },
  {
    labels: ['Catálogo', 'Categorías'],
    path: '/catalog/categories',
  },
  {
    labels: ['Catálogo', 'Tipos de precios'],
    path: '/catalog/price-types',
  },
  {
    labels: ['Inventario', 'Almacenes'],
    path: '/inventory/warehouses',
  },
  {
    labels: ['Finanzas', 'Facturación', 'Facturas'],
    path: '/finance/billing/invoices',
  },
  {
    labels: ['Finanzas', 'Facturación', 'Devoluciones'],
    path: '/finance/billing/returns',
  },
  {
    labels: ['Finanzas', 'Facturación', 'Notas de crédito'],
    path: '/finance/billing/credit-notes',
  },
  {
    labels: ['Finanzas', 'Facturación', 'Notas de débito'],
    path: '/finance/billing/debit-notes',
  },
  {
    labels: ['Finanzas', 'Tesorería', 'Caja'],
    path: '/finance/treasury/cash-register',
  },
  {
    labels: ['Finanzas', 'Tesorería', 'Historial de caja'],
    path: '/finance/treasury/cash-register/history',
  },
  {
    labels: ['Finanzas', 'Tesorería', 'Cuentas por cobrar'],
    path: '/finance/treasury/receivables',
  },
  {
    labels: ['Finanzas', 'Tesorería', 'Métodos de pago'],
    path: '/finance/treasury/payment-methods',
  },
  {
    labels: ['Contactos', 'Clientes'],
    path: '/partners/customers',
  },
  {
    labels: ['Contactos', 'Proveedores'],
    path: '/partners/suppliers',
  },
  {
    labels: ['Análisis', 'Dashboard'],
    path: '/analytics/dashboard',
  },
  {
    labels: ['Análisis', 'Reportes', 'Inventario consolidado'],
    path: '/analytics/reports/inventory',
  },
  {
    labels: ['Plataforma', 'Usuarios'],
    path: '/platform/users',
  },
  {
    labels: ['Plataforma', 'Configuración'],
    path: '/platform/auth/configuration',
  },
] as const;

for (const destination of destinations) {
  test(`given desktop navigation when selecting ${destination.labels.join(' / ')} then the existing route opens`, async ({
    page,
  }) => {
    await authenticate(page);
    await page.goto('/analytics/dashboard');
    await openDesktop(page, destination.labels);
    await expect(page).toHaveURL(new RegExp(`${destination.path.replaceAll('/', '\\/')}$`));
  });
}

for (const destination of [...destinations]) {
  test(`given mobile navigation when selecting ${destination.labels.join(' / ')} then the existing route opens`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await authenticate(page);
    await page.goto('/analytics/dashboard');
    await openMobile(page, destination.labels);
    await expect(page).toHaveURL(new RegExp(`${destination.path.replaceAll('/', '\\/')}$`));
  });
}

const reports = [
  { group: 'Ventas', label: 'Reporte de Presupuestos PDF', title: 'Reporte de Presupuestos - PDF' },
  { group: 'Ventas', label: 'Reporte de Pedidos PDF', title: 'Reporte de Pedidos - PDF' },
  {
    group: 'Finanzas',
    subgroup: 'Facturación',
    label: 'Reporte de Facturas PDF',
    title: 'Reporte de Facturas - PDF',
  },
  { group: 'Compras', label: 'Reporte de Compras PDF', title: 'Reporte de Compras - PDF' },
  { group: 'Inventario', label: 'Stock PDF', title: 'Stock de Almacenes' },
  { group: 'Inventario', label: 'Movimientos PDF', title: 'Historial de Movimientos' },
  { group: 'Catálogo', label: 'Reporte de Productos PDF', title: 'Catálogo de Productos' },
  { group: 'Catálogo', label: 'Catálogo Comercial PDF', title: 'Catálogo Comercial' },
  {
    group: 'Finanzas',
    subgroup: 'Tesorería',
    label: 'Reportes de Caja',
    title: 'Reportes de Caja',
  },
  {
    group: 'Finanzas',
    subgroup: 'Tesorería',
    label: 'Cuentas por Cobrar PDF',
    title: 'Cuentas por Cobrar - PDF',
  },
] as const;

for (const report of reports) {
  test(`given report navigation when selecting ${report.label} then the existing report dialog opens`, async ({
    page,
  }) => {
    await authenticate(page);
    await page.goto('/analytics/dashboard');
    await openDesktop(page, [
      report.group,
      ...('subgroup' in report ? [report.subgroup] : []),
      'Reportes',
      report.label,
    ]);
    await expect(page.getByRole('dialog', { name: report.title, exact: true })).toBeVisible();
  });
}

test('given desktop keyboard navigation when opening sales documents then Enter opens quotes', async ({
  page,
}) => {
  await authenticate(page);
  await page.goto('/analytics/dashboard');
  await page.locator('.p-menubar-root-list').focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/sales\/quotes$/);
});

test('given a finance operator when root navigation loads then unrelated groups are absent', async ({
  page,
}) => {
  await authenticate(page, ['FINANCES', 'DOCUMENT_ADMIN'], 'OPERATOR');
  await page.goto('/finance/treasury/receivables');
  await expect(
    page.locator('.p-menubar-root-list > li > .p-menubar-item-content .p-menubar-item-label'),
  ).toHaveText(['Finanzas', 'Plataforma']);
});

test('given a finance operator when opening reports then only authorized finance reports remain', async ({
  page,
}) => {
  await authenticate(page, ['FINANCES', 'DOCUMENT_ADMIN'], 'OPERATOR');
  await page.goto('/finance/treasury/receivables');
  await openDesktop(page, ['Finanzas', 'Tesorería', 'Reportes']);
  await expect(
    page
      .locator('p-menubar .p-menubar-submenu:visible')
      .last()
      .locator(':scope > li > .p-menubar-item-content .p-menubar-item-label'),
  ).toHaveText(['Reportes de Caja', 'Cuentas por Cobrar PDF']);
});

test('given a catalog operator when opening catalog then products categories and pricing remain without sales documents', async ({
  page,
}) => {
  await authenticate(page, ['CATALOG'], 'OPERATOR');
  await page.goto('/catalog/products');
  await openDesktop(page, ['Catálogo']);
  await expect(
    page.locator(
      'p-menubar .p-menubar-submenu:visible > li > .p-menubar-item-content .p-menubar-item-label',
    ),
  ).toHaveText(['Productos', 'Categorías', 'Tipos de precios']);
});

test('given finance navigation when viewing treasury then all groups fit on desktop', async ({
  page,
}) => {
  await authenticate(page);
  await page.goto('/analytics/dashboard');
  await openDesktop(page, ['Finanzas', 'Tesorería']);
  await page.screenshot({ path: 'output/design/navigation-finance-desktop.png' });
  await expect(page.locator('p-menubar .p-menubar-submenu:visible').last()).toBeInViewport();
});

test('given mobile navigation when opening treasury then nested destinations stay in the drawer', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await authenticate(page);
  await page.goto('/analytics/dashboard');
  await openMobile(page, ['Finanzas', 'Tesorería']);
  const history = page
    .locator('.cashly-navigation-drawer')
    .getByText('Historial de caja', { exact: true });
  await page.locator('.cashly-navigation-drawer').evaluate(async (drawer) => {
    await Promise.all(
      drawer
        .getAnimations({ subtree: true })
        .map((animation) => animation.finished.catch(() => undefined)),
    );
  });
  await history.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await history.scrollIntoViewIfNeeded();
  await expect(history).toBeInViewport({ ratio: 1 });
  await page.screenshot({ path: 'output/design/navigation-finance-mobile.png' });
});

for (const [legacy, canonical] of [
  ['/quotes?search=legacy#documents', '/sales/quotes?search=legacy#documents'],
  ['/orders', '/sales/orders'],
  ['/invoices', '/finance/billing/invoices'],
  [
    '/cash-register/history?closed=true#sessions',
    '/finance/treasury/cash-register/history?closed=true#sessions',
  ],
  ['/reports/inventory?warehouse=main#stock', '/analytics/reports/inventory?warehouse=main#stock'],
  ['/auth/configuration', '/platform/auth/configuration'],
] as const) {
  test(`legacy bookmark ${legacy} opens the canonical ERP screen`, async ({ page }) => {
    await authenticate(page);
    await page.goto(legacy);
    await expect(page).toHaveURL(new URL(canonical, 'http://127.0.0.1:4300').href);
    await expect(page.locator('app-main-layout')).toBeVisible();
  });
}

test('an inventory operator cannot bypass invoice permission through a legacy bookmark', async ({
  page,
}) => {
  const invoiceRequests: string[] = [];
  await authenticate(page, ['INVENTORY'], 'OPERATOR');
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api/invoices'))
      invoiceRequests.push(request.url());
  });
  await page.goto('/invoices');
  await expect(page).toHaveURL(/\/platform\/auth\/configuration$/);
  expect(invoiceRequests).toEqual([]);
});

test('an operator without business permissions reaches account configuration without a redirect loop', async ({
  page,
}) => {
  await authenticate(page, [], 'OPERATOR');
  await page.goto('/');
  await expect(page).toHaveURL(/\/platform\/auth\/configuration$/);
  await expect(
    page.locator('.p-menubar-root-list > li > .p-menubar-item-content .p-menubar-item-label'),
  ).toHaveText(['Plataforma']);
});

test('all ERP roots fit in the desktop header at 1280 pixels', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await authenticate(page);
  await page.goto('/analytics/dashboard');
  const labels = page.locator(
    '.p-menubar-root-list > li > .p-menubar-item-content .p-menubar-item-label',
  );
  await expect(labels).toHaveText(rootLabels);
  for (const label of await labels.all()) await expect(label).toBeInViewport({ ratio: 1 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({
    path: 'output/playwright/area-navigation/desktop-1280.png',
    fullPage: true,
  });
});

test('mobile drawer exposes the same eight ERP roots', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await authenticate(page);
  await page.goto('/analytics/dashboard');
  await page.getByRole('button', { name: 'Menú', exact: true }).click();
  const drawer = page.locator('.cashly-navigation-drawer');
  for (const label of rootLabels) {
    const area = drawer.getByRole('button', { name: label, exact: true });
    await area.scrollIntoViewIfNeeded();
    await expect(area).toBeInViewport({ ratio: 1 });
  }
  await page.screenshot({
    path: 'output/playwright/area-navigation/mobile-390-bottom.png',
    fullPage: true,
  });
});

for (const [modules, destination] of [
  [['INVENTORY'], '/catalog/products'],
  [['DOCUMENT_ADMIN'], '/platform/auth/configuration'],
] as const) {
  test(`consolidated reporting rejects users with only ${modules[0]} permission`, async ({
    page,
  }) => {
    await authenticate(page, [...modules], 'OPERATOR');
    await page.goto('/analytics/reports/inventory');
    await expect(page).toHaveURL(new URL(destination, 'http://127.0.0.1:4300').href);
  });
}

for (const [area, modules, destination] of [
  ['/sales', ['SALES'], '/sales/quotes'],
  ['/inventory', ['INVENTORY'], '/inventory/warehouses'],
  ['/finance/billing', ['FINANCES'], '/finance/billing/credit-notes'],
  ['/finance/treasury', ['FINANCES'], '/finance/treasury/cash-register'],
  ['/platform', ['SALES'], '/platform/auth/configuration'],
] as const) {
  test(`area root ${area} opens an authorized screen inside the requested area`, async ({
    page,
  }) => {
    await authenticate(page, [...modules], 'OPERATOR');
    await page.goto(area);
    await expect(page).toHaveURL(new URL(destination, 'http://127.0.0.1:4300').href);
  });
}
