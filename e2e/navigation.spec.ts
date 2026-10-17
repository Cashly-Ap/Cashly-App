import { expect, test, type Page } from '@playwright/test';

const allModules = [
  'DASHBOARD',
  'SALES',
  'PURCHASES',
  'INVENTORY',
  'FINANCES',
  'DOCUMENT_ADMIN',
  'USERS',
];
const rootLabels = [
  'Dashboard',
  'Ventas',
  'Compras',
  'Inventario',
  'Finanzas',
  'Reportes',
  'Administración',
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
    const item = index === 0
      ? drawer.getByRole('button', { name: label, exact: true })
      : drawer.getByRole('treeitem', { name: label, exact: true });
    await item.click();
  }
}

test('given a super administrator when navigation loads then ERP root groups follow business order', async ({
  page,
}) => {
  await authenticate(page);
  await page.goto('/dashboard');
  await expect(
    page.locator('.p-menubar-root-list > li > .p-menubar-item-content .p-menubar-item-label'),
  ).toHaveText(rootLabels);
});

const destinations = [
  { labels: ['Ventas', 'Clientes'], path: '/customers' },
  { labels: ['Ventas', 'Documentos de venta', 'Presupuestos'], path: '/quotes' },
  { labels: ['Ventas', 'Documentos de venta', 'Pedidos'], path: '/orders' },
  { labels: ['Ventas', 'Documentos de venta', 'Facturas'], path: '/invoices' },
  { labels: ['Ventas', 'Tipos de precios'], path: '/price-types' },
  { labels: ['Compras', 'Proveedores'], path: '/suppliers' },
  { labels: ['Compras', 'Abastecimiento', 'Compras'], path: '/purchases' },
  { labels: ['Inventario', 'Catálogo', 'Productos'], path: '/products' },
  { labels: ['Inventario', 'Catálogo', 'Categorías'], path: '/categories' },
  { labels: ['Inventario', 'Logística', 'Almacenes'], path: '/warehouses' },
  { labels: ['Finanzas', 'Tesorería', 'Caja'], path: '/cash-register' },
  { labels: ['Finanzas', 'Tesorería', 'Historial de caja'], path: '/cash-register/history' },
  { labels: ['Finanzas', 'Cartera', 'Cuentas por cobrar'], path: '/receivables' },
  { labels: ['Finanzas', 'Ajustes documentales', 'Notas de crédito'], path: '/credit-notes' },
  { labels: ['Finanzas', 'Ajustes documentales', 'Notas de débito'], path: '/debit-notes' },
  { labels: ['Finanzas', 'Ajustes documentales', 'Devoluciones'], path: '/returns' },
  { labels: ['Finanzas', 'Configuración', 'Métodos de pago'], path: '/payment-methods' },
  { labels: ['Administración', 'Seguridad y acceso', 'Usuarios'], path: '/users' },
] as const;

for (const destination of destinations) {
  test(`given desktop navigation when selecting ${destination.labels.join(' / ')} then the existing route opens`, async ({
    page,
  }) => {
    await authenticate(page);
    await page.goto('/dashboard');
    await openDesktop(page, destination.labels);
    await expect(page).toHaveURL(new RegExp(`${destination.path.replaceAll('/', '\\/')}$`));
  });
}

for (const destination of [
  destinations[1],
  destinations[6],
  destinations[9],
  destinations[11],
  destinations[17],
]) {
  test(`given mobile navigation when selecting ${destination.labels.join(' / ')} then the existing route opens`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await authenticate(page);
    await page.goto('/dashboard');
    await openMobile(page, destination.labels);
    await expect(page).toHaveURL(new RegExp(`${destination.path.replaceAll('/', '\\/')}$`));
  });
}

const reports = [
  { group: 'Ventas', label: 'Reporte de Presupuestos PDF', title: 'Reporte de Presupuestos - PDF' },
  { group: 'Ventas', label: 'Reporte de Pedidos PDF', title: 'Reporte de Pedidos - PDF' },
  { group: 'Ventas', label: 'Reporte de Facturas PDF', title: 'Reporte de Facturas - PDF' },
  { group: 'Compras', label: 'Reporte de Compras PDF', title: 'Reporte de Compras - PDF' },
  { group: 'Inventario', label: 'Stock PDF', title: 'Stock de Almacenes' },
  { group: 'Inventario', label: 'Movimientos PDF', title: 'Historial de Movimientos' },
  { group: 'Inventario', label: 'Reporte de Productos PDF', title: 'Catálogo de Productos' },
  { group: 'Inventario', label: 'Catálogo Comercial PDF', title: 'Catálogo Comercial' },
  { group: 'Finanzas', label: 'Reportes de Caja', title: 'Reportes de Caja' },
  { group: 'Finanzas', label: 'Cuentas por Cobrar PDF', title: 'Cuentas por Cobrar - PDF' },
] as const;

for (const report of reports) {
  test(`given report navigation when selecting ${report.label} then the existing report dialog opens`, async ({
    page,
  }) => {
    await authenticate(page);
    await page.goto('/dashboard');
    await openDesktop(page, ['Reportes', report.group, report.label]);
    await expect(page.getByRole('dialog', { name: report.title, exact: true })).toBeVisible();
  });
}

test('given desktop keyboard navigation when opening sales documents then Enter opens quotes', async ({
  page,
}) => {
  await authenticate(page);
  await page.goto('/dashboard');
  await page.locator('.p-menubar-root-list').focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/quotes$/);
});

test('given a finance operator when root navigation loads then unrelated groups are absent', async ({
  page,
}) => {
  await authenticate(page, ['FINANCES', 'DOCUMENT_ADMIN'], 'OPERATOR');
  await page.goto('/receivables');
  await expect(
    page.locator('.p-menubar-root-list > li > .p-menubar-item-content .p-menubar-item-label'),
  ).toHaveText(['Finanzas', 'Reportes']);
});

test('given a finance operator when opening reports then only authorized finance reports remain', async ({
  page,
}) => {
  await authenticate(page, ['FINANCES', 'DOCUMENT_ADMIN'], 'OPERATOR');
  await page.goto('/receivables');
  await openDesktop(page, ['Reportes']);
  await expect(
    page.locator(
      'p-menubar .p-menubar-submenu:visible > li > .p-menubar-item-content .p-menubar-item-label',
    ),
  ).toHaveText(['Finanzas']);
});

test('given an inventory operator when opening sales then the pricing leaf remains without sales documents', async ({
  page,
}) => {
  await authenticate(page, ['INVENTORY'], 'OPERATOR');
  await page.goto('/products');
  await openDesktop(page, ['Ventas']);
  await expect(
    page.locator(
      'p-menubar .p-menubar-submenu:visible > li > .p-menubar-item-content .p-menubar-item-label',
    ),
  ).toHaveText(['Tipos de precios']);
});

test('given finance navigation when viewing treasury then all groups fit on desktop', async ({
  page,
}) => {
  await authenticate(page);
  await page.goto('/dashboard');
  await openDesktop(page, ['Finanzas', 'Tesorería']);
  await page.screenshot({ path: 'output/design/navigation-finance-desktop.png' });
  await expect(page.locator('p-menubar .p-menubar-submenu:visible').last()).toBeInViewport();
});

test('given mobile navigation when opening treasury then nested destinations stay in the drawer', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await authenticate(page);
  await page.goto('/dashboard');
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
