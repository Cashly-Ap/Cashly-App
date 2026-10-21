import { test, expect, type Page } from '@playwright/test';
import { currentAccessFixture } from './access.fixture';

interface Preferences { themeMode: 'system' | 'light' | 'dark'; colorMode: 'minimal' | 'informative'; shortcutsEnabled: boolean; showShortcutHints: boolean }
const defaults: Preferences = { themeMode: 'system', colorMode: 'minimal', shortcutsEnabled: false, showShortcutHints: true };
const user = { id: 'preferences-user', userName: 'Preferences User', firstName: 'Preferences', lastName: 'User', email: 'preferences@example.com', type: 'SUPER_ADMIN', role: 'SUPER_ADMIN', active: true, photoPath: null, roleId: 'role-e2e', departmentId: 'department-e2e' };
async function setup(page: Page, account = { value: { ...defaults }, failSave: false }, modules?: string[]) {
  await page.addInitScript(user => {
    localStorage.setItem('accessToken', 'test-access'); localStorage.setItem('refreshToken', 'test-refresh');
    localStorage.setItem('currentUser', JSON.stringify(user));
  }, user);
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname;
    let json: unknown = [];
    if (path.endsWith('/auth/access')) json = currentAccessFixture(modules, !modules);
    else if (path.endsWith('/auth/profile')) json = user;
    else if (path.endsWith('/unread-count')) json = 0;
    else if (path.endsWith('/company')) json = { legalName: 'Cashly', tradeName: null, logoPath: null };
    else if (path.endsWith('/auth/preferences')) {
      if (route.request().method() === 'PUT') {
        if (account.failSave) return route.fulfill({ status: 500, json: { message: 'Test failure' } });
        account.value = route.request().postDataJSON();
      }
      json = account.value;
    } else if (path.endsWith('/summary')) json = { monthlySales: 300, pendingOrders: 2, overdueReceivables: 1, lowStockProducts: 4 };
    else if (path.endsWith('/monthly-sales')) json = [{ month: '2026-09', total: 100 }, { month: '2026-10', total: 300 }];
    else if (path.endsWith('/top-products') || path.endsWith('/top-customers')) json = [{ id: '1', name: 'Ejemplo A', total: 100 }, { id: '2', name: 'Ejemplo B', total: 200 }];
    else if (path.endsWith('/invoice-due-schedule')) json = [{ invoiceId: 'due-1', invoiceNumber: 'FAC-001', customerId: '1', customerName: 'Cliente', dueDate: '2026-10-25', amount: 200 }];
    else if (path.endsWith('/users')) json = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 };
    return route.fulfill({ json });
  });
  return account;
}
const radio = (page: Page, value: string) => page.locator(`input[type=radio][value="${value}"]`);

test('settings are only in user menu and preferences synchronize into a fresh browser session', async ({ page, browser }) => {
  const account = await setup(page);
  await page.goto('/analytics/dashboard');
  await page.getByRole('button', { name: 'Abrir menú de usuario' }).click();
  await page.getByRole('button', { name: /Configuración/ }).click();
  await expect(page).toHaveURL(/\/platform\/auth\/preferences$/);
  await expect(page.getByRole('heading', { name: 'Configuración', exact: true })).toBeVisible();
  await radio(page, 'dark').check();
  await expect.poll(() => account.value.themeMode).toBe('dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveClass(/my-app-dark/);
  await radio(page, 'informative').check();
  await expect.poll(() => account.value.colorMode).toBe('informative');
  const fresh = await browser.newContext();
  const other = await fresh.newPage();
  await setup(other, account);
  await other.goto('/platform/auth/preferences');
  await expect(radio(other, 'dark')).toBeChecked();
  await expect(radio(other, 'informative')).toBeChecked();
  await expect(other.locator('html')).toHaveClass(/my-app-dark/);
  await fresh.close();
});

test('system tracks OS changes live while explicit theme remains selected', async ({ page }) => {
  await setup(page);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/platform/auth/preferences');
  await expect(radio(page, 'system')).toBeChecked();
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveClass(/my-app-dark/);
  await expect(radio(page, 'system')).toBeChecked();
  await radio(page, 'light').check();
  await expect(page.locator('html')).not.toHaveClass(/my-app-dark/);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).not.toHaveClass(/my-app-dark/);
});

test('save failures restore the saved appearance and retry persists the intended change', async ({ page }) => {
  const account = await setup(page);
  await page.goto('/platform/auth/preferences');
  await expect(radio(page, 'dark')).toBeEnabled();
  account.failSave = true;
  await radio(page, 'dark').check();
  await expect(page.locator('app-preferences-page').getByRole('alert')).toContainText('Se ha restaurado');
  await expect(radio(page, 'system')).toBeChecked();
  account.failSave = false;
  await page.getByRole('button', { name: 'Reintentar configuración' }).click();
  await expect(radio(page, 'dark')).toBeChecked();
  await expect.poll(() => account.value.themeMode).toBe('dark');
});

test('informative colors cover modules and charts without changing shared card shadows', async ({ page }) => {
  const account = await setup(page);
  await page.goto('/platform/auth/preferences');
  const panel = page.locator('app-details-card .cashly-panel').first();
  const geometry = await panel.evaluate(el => ({ radius: getComputedStyle(el).borderRadius, shadow: getComputedStyle(el).boxShadow }));
  for (const theme of ['light', 'dark', 'system']) {
    await radio(page, theme).check();
    await expect.poll(() => account.value.themeMode).toBe(theme);
    for (const mode of ['informative', 'minimal']) {
      await radio(page, mode).check();
      await expect.poll(() => account.value.colorMode).toBe(mode);
      expect(await panel.evaluate(el => ({ radius: getComputedStyle(el).borderRadius, shadow: getComputedStyle(el).boxShadow }))).toEqual(geometry);
      await page.screenshot({ path: `output/playwright/preferences/settings-${theme}-${mode}.png`, fullPage: true });
    }
  }
  await radio(page, 'informative').check();
  await page.goto('/analytics/dashboard');
  await expect(page.locator('canvas')).toHaveCount(4);
  await expect(page.locator('html')).toHaveClass(/cashly-informative/);
  const colors = await page.locator('.dashboard-metric').evaluateAll(items => items.map(el => getComputedStyle(el).backgroundColor));
  expect(new Set(colors).size).toBeGreaterThan(1);
  await page.screenshot({ path: 'output/playwright/preferences/dashboard-informative.png', fullPage: true });
});

test('enabled shortcuts navigate authorized modules, open filters and create, then cancel an active form', async ({ page }) => {
  const account = await setup(page, { value: { ...defaults }, failSave: false }, ['USERS', 'ROLES', 'DEPARTMENTS']);
  await page.goto('/platform/auth/preferences');
  await page.getByRole('heading', { name: 'Configuración', exact: true }).click();
  await page.keyboard.press('m');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('switch', { name: /Habilitar atajos de teclado/ }).check();
  await expect.poll(() => account.value.shortcutsEnabled).toBe(true);
  await page.getByRole('heading', { name: 'Configuración', exact: true }).click();
  await page.keyboard.press('m');
  const navigator = page.getByRole('dialog', { name: 'Ir a un módulo' });
  await expect(navigator).toBeVisible();
  await expect(navigator.getByRole('button', { name: /Ventas/ })).toHaveCount(0);
  await navigator.getByLabel('Buscar módulo').fill('Usuarios');
  await navigator.getByRole('option', { name: /Plataforma \/ Usuarios/ }).click();
  await expect(page).toHaveURL(/\/platform\/users$/);
  await expect(navigator).not.toBeVisible();
  await expect(page.locator('[appShortcut=filter]')).toBeVisible();
  await page.getByRole('heading', { name: 'Usuarios', exact: true }).click();
  await page.keyboard.press('f');
  await expect(page.getByText('Filtros', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('heading', { name: 'Usuarios', exact: true }).click();
  await page.keyboard.press('n');
  await expect(page).toHaveURL(/\/platform\/users\/new$/);
  const input = page.getByRole('textbox', { name: 'Nombre', exact: true });
  await input.focus();
  await page.keyboard.press('m');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/platform\/users\/new$/);
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/platform\/users$/);
});

test('mobile settings use shared cards and fit without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page);
  await page.goto('/analytics/dashboard');
  await page.getByRole('button', { name: 'Menú', exact: true }).click();
  await page.getByRole('button', { name: /Configuración/ }).click();
  await expect(page).toHaveURL(/\/platform\/auth\/preferences$/);
  await expect(page.locator('app-details-card .cashly-panel')).toHaveCount(3);
  await radio(page, 'informative').check();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'output/playwright/preferences/settings-mobile.png', fullPage: true });
});


test('simple save shortcut submits the valid form outside editable controls', async ({ page }) => {
  await setup(page, { value: { ...defaults, shortcutsEnabled: true }, failSave: false }, ['COMPANY']);
  let savedName = '';
  let company = { id: 'installation', legalName: 'Cashly', tradeName: null, taxId: null, email: null, phone: null, website: null, address: null, logoPath: null };
  await page.route('**/api/company', route => {
    if (route.request().method() === 'PUT') {
      company = { ...company, ...route.request().postDataJSON() };
      savedName = company.legalName;
    }
    return route.fulfill({ json: company });
  });
  await page.goto('/platform/company/edit');
  await page.getByLabel('Razón social', { exact: true }).fill('Empresa por teclado');
  await page.keyboard.press('g');
  expect(savedName).toBe('');
  await page.getByLabel('Razón social', { exact: true }).fill('Empresa por teclado');
  await page.getByRole('button', { name: /Guardar cambios/ }).focus();
  await page.keyboard.press('g');
  await expect.poll(() => savedName).toBe('Empresa por teclado');
  await expect(page).toHaveURL(/\/platform\/company$/);
  await expect(page.getByRole('heading', { name: 'Empresa por teclado' })).toBeVisible();
});


test('contextual help can be hidden per account and follows available page actions', async ({ page, browser }) => {
  const account = await setup(page, { value: { ...defaults, shortcutsEnabled: true }, failSave: false }, ['USERS', 'ROLES', 'DEPARTMENTS']);
  await page.goto('/platform/users');
  const help = page.getByRole('complementary', { name: 'Atajos de esta pantalla' });
  await expect(help).toBeVisible();
  await expect(help).toContainText('Nuevo registro');
  await expect(help).toContainText('Abrir filtros');
  await expect(help).not.toContainText('Guardar o aceptar');
  await page.screenshot({ path: 'output/playwright/preferences/simple-shortcut-help.png' });
  await page.goto('/platform/auth/preferences');
  await page.getByRole('switch', { name: 'Mostrar atajos en cada pantalla', exact: true }).uncheck();
  await expect.poll(() => account.value.showShortcutHints).toBe(false);
  await page.goto('/platform/users');
  await expect(help).toHaveCount(0);
  await page.getByRole('heading', { name: 'Usuarios', exact: true }).click();
  await page.keyboard.press('n');
  await expect(page).toHaveURL(/\/platform\/users\/new$/);
  await page.getByRole('button', { name: /Cancelar/ }).focus();
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/platform\/users$/);
  const context = await browser.newContext();
  const fresh = await context.newPage(); await setup(fresh, account);
  await fresh.goto('/platform/auth/preferences');
  await expect(fresh.getByRole('switch', { name: 'Mostrar atajos en cada pantalla', exact: true })).not.toBeChecked();
  await context.close();
});

test('dialog help replaces background actions and Escape closes just the active dialog', async ({ page }) => {
  await setup(page, { value: { ...defaults, shortcutsEnabled: true }, failSave: false }, ['USERS']);
  await page.goto('/platform/users');
  await expect(page.getByRole('complementary', { name: 'Atajos de esta pantalla' })).toBeVisible();
  await page.getByRole('heading', { name: 'Usuarios', exact: true }).click();
  await page.keyboard.press('m');
  const modal = page.getByRole('dialog', { name: 'Ir a un módulo' });
  await expect(modal).toBeVisible();
  const dialogHelp = modal.getByRole('complementary', { name: 'Atajos de este diálogo' });
  await expect(dialogHelp).toBeVisible();
  await expect(dialogHelp).toContainText('Esc');
  await expect(dialogHelp).not.toContainText('Nuevo registro');
  await expect(page.getByRole('complementary', { name: 'Atajos de esta pantalla' })).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(modal).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(modal).not.toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Atajos de esta pantalla' })).toBeVisible();
  await expect(page).toHaveURL(/\/platform\/users$/);
});


test('module picker supports arrows, J/K, Enter and an explicit focus-exit button', async ({ page }) => {
  await setup(page, { value: { ...defaults, shortcutsEnabled: true }, failSave: false }, ['USERS', 'ROLES', 'DEPARTMENTS']);
  await page.goto('/platform/users');
  await page.getByRole('heading', { name: 'Usuarios', exact: true }).click(); await page.keyboard.press('m');
  const modal = page.getByRole('dialog', { name: 'Ir a un módulo' });
  const search = modal.getByRole('combobox', { name: 'Buscar módulo' });
  await search.fill('Plataforma'); await page.keyboard.press('ArrowDown');
  await expect(modal.getByRole('option', { selected: true })).toContainText('Usuarios');
  await page.keyboard.press('ArrowDown'); await expect(modal.getByRole('option', { selected: true })).toContainText('Roles');
  await page.keyboard.press('Escape');
  await expect(modal).toBeVisible(); await expect(search).not.toBeFocused();
  await page.keyboard.press('k'); await expect(modal.getByRole('option', { selected: true })).toContainText('Usuarios');
  await page.keyboard.press('j'); await expect(modal.getByRole('option', { selected: true })).toContainText('Roles');
  await page.screenshot({ path: 'output/playwright/preferences/module-keyboard-selection.png' });
  await search.fill('j'); await expect(search).toHaveValue('j'); await expect(modal.getByRole('option')).toHaveCount(0);
  await search.fill('Usuarios'); await modal.getByRole('button', { name: 'Navegar resultados' }).click();
  await expect(modal.getByRole('listbox')).toBeFocused(); await page.keyboard.press('Enter');
  await expect(modal).not.toBeVisible(); await expect(page).toHaveURL(/\/platform\/users$/);
});

test('J/K scroll the page and Escape or the focus button leaves editable fields', async ({ page }) => {
  await setup(page, { value: { ...defaults, shortcutsEnabled: true }, failSave: false });
  await page.goto('/platform/auth/preferences');
  await page.getByRole('heading', { name: 'Configuración', exact: true }).click();
  await page.keyboard.press('j'); await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await page.keyboard.press('k'); await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.goto('/platform/users');
  await page.getByRole('textbox', { name: 'Buscar usuarios...', exact: true }).fill('jk');
  await page.getByRole('button', { name: 'Quitar foco del campo' }).click();
  await expect(page.getByRole('textbox', { name: 'Buscar usuarios...', exact: true })).not.toBeFocused();
});

test('screen shortcut help stays visible while filtering and searching', async ({ page }) => {
  await setup(page, { value: { ...defaults, shortcutsEnabled: true }, failSave: false }, ['USERS']);
  await page.goto('/platform/users');
  const help = page.getByRole('complementary', { name: 'Atajos de esta pantalla' });
  await expect(help).toBeVisible();
  await page.getByRole('heading', { name: 'Usuarios', exact: true }).click();
  await page.keyboard.press('f');
  await expect(page.locator('.p-popover')).toBeVisible();
  await expect(help).toBeVisible();
  await expect(help).toContainText('Nuevo registro');
  await page.locator('.p-popover').getByRole('combobox').first().click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(help).toBeVisible();
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  await page.getByRole('textbox', { name: 'Buscar usuarios...', exact: true }).fill('Ana');
  await expect(help).toBeVisible();
  await expect(help).toContainText('Enfocar búsqueda');
});
