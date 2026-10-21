import { expect, test, type Page } from '@playwright/test';
import { currentAccessFixture } from './access.fixture';

const user = {
  id: 'mfa-user',
  email: 'mfa@example.com',
  userName: 'MFA Admin',
  type: 'SUPER_ADMIN',
  role: 'SUPER_ADMIN',
  active: true,
  modulePermissions: ['DASHBOARD'],
};
const session = {
  accessToken: 'verified-access',
  refreshToken: 'verified-refresh',
  tokenType: 'Bearer',
  expiresIn: 3600000,
  entity: user,
};

async function mockShell(page: Page): Promise<void> {
  await page.route('**/api/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    const body = path.endsWith('/auth/access')
      ? currentAccessFixture()
      : path.endsWith('/notifications/unread-count')
        ? 0
        : path.endsWith('/dashboard/summary')
          ? { monthlySales: 0, pendingOrders: 0, overdueReceivables: 0, lowStockProducts: 0 }
          : [];
    return route.fulfill({ json: body });
  });
}

async function loginChallenge(page: Page): Promise<void> {
  await mockShell(page);
  await page.route('**/api/auth/login', (route) =>
    route.fulfill({
      json: { mfaRequired: true, challengeToken: 'pending-challenge', expiresIn: 300 },
    }),
  );
  await page.goto('/platform/auth/login');
  await page.getByLabel('Email', { exact: true }).fill(user.email);
  await page.getByLabel('Contraseña', { exact: true }).fill('ValidPassword1!');
  await page.getByRole('button', { name: /Iniciar Sesión$/ }).click();
  await expect(page.getByRole('heading', { name: 'Verificación en dos pasos' })).toBeVisible();
}

async function authenticate(page: Page): Promise<void> {
  await page.addInitScript(
    ({ user }) => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('accessToken', 'existing-access');
      localStorage.setItem('refreshToken', 'existing-refresh');
      localStorage.setItem('currentUser', JSON.stringify(user));
    },
    { user },
  );
  await mockShell(page);
}

test('password acceptance requires the second factor before storing any session', async ({
  page,
}) => {
  await loginChallenge(page);
  await page.screenshot({ path: 'output/playwright/mfa/login-desktop.png', fullPage: true });
  expect(
    await page.evaluate(() =>
      ['accessToken', 'refreshToken', 'currentUser'].map((key) => localStorage.getItem(key)),
    ),
  ).toEqual([null, null, null]);
});

test('mobile second-factor screen fits without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await loginChallenge(page);
  await page.screenshot({ path: 'output/playwright/mfa/login-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

for (const code of ['123456', 'ABCDE-FGHIJ']) {
  test(`second factor ${code.length === 6 ? 'authenticator' : 'recovery'} code completes login`, async ({
    page,
  }) => {
    await loginChallenge(page);
    let requestBody: unknown;
    await page.route('**/api/auth/mfa/verify', async (route) => {
      requestBody = route.request().postDataJSON();
      await route.fulfill({ json: session });
    });
    await page.getByLabel('Código de verificación o recuperación').fill(code);
    await page.getByRole('button', { name: 'Verificar e iniciar sesión' }).click();
    await expect(page).toHaveURL(/\/analytics\/dashboard$/);
    expect(requestBody).toEqual({ challengeToken: 'pending-challenge', code });
    expect(await page.evaluate(() => localStorage.getItem('accessToken'))).toBe(
      session.accessToken,
    );
  });
}

for (const message of [
  'Código de verificación incorrecto',
  'El desafío de autenticación ha caducado',
]) {
  test(`rejected verification retains no authenticated session: ${message}`, async ({ page }) => {
    await loginChallenge(page);
    await page.route('**/api/auth/mfa/verify', (route) =>
      route.fulfill({ status: 401, json: { message } }),
    );
    await page.getByLabel('Código de verificación o recuperación').fill('000000');
    await page.getByRole('button', { name: 'Verificar e iniciar sesión' }).click();
    await expect(
      page.getByText(
        'Código incorrecto o verificación caducada. Inténtalo de nuevo o vuelve a iniciar sesión.',
        { exact: true },
      ),
    ).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('accessToken'))).toBeNull();
  });
}

for (const mobile of [false, true]) {
  test(`security opens from ${mobile ? 'mobile' : 'desktop'} profile navigation`, async ({
    page,
  }) => {
    if (mobile) await page.setViewportSize({ width: 390, height: 844 });
    await authenticate(page);
    await page.route('**/api/auth/mfa', (route) =>
      route.fulfill({ json: { enabled: false, recoveryCodesRemaining: 0 } }),
    );
    await page.goto('/analytics/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
    await page
      .getByRole('button', { name: mobile ? 'Menú' : 'Abrir menú de usuario', exact: true })
      .click();
    await page.getByRole('button', { name: /Seguridad$/ }).click();
    await expect(page).toHaveURL(/\/platform\/auth\/security$/);
    await expect(page.getByRole('heading', { name: 'Seguridad', exact: true })).toBeVisible();
    await expect(page.locator('.p-drawer')).toBeHidden();
    await expect(page.locator('.p-popover')).toBeHidden();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({
      path: `output/playwright/mfa/security-${mobile ? 'mobile' : 'desktop'}.png`,
      fullPage: true,
    });
  });
}

test('enrollment confirms authenticator before showing recovery codes and ending the old session', async ({
  page,
}) => {
  await authenticate(page);
  await page.route('**/api/auth/mfa', (route) =>
    route.fulfill({ json: { enabled: false, recoveryCodesRemaining: 0 } }),
  );
  await page.route('**/api/auth/mfa/setup', (route) =>
    route.fulfill({
      json: {
        secret: 'JBSWY3DPEHPK3PXP',
        otpauthUri: 'otpauth://totp/Cashly:mfa%40example.com?secret=JBSWY3DPEHPK3PXP&issuer=Cashly',
        expiresIn: 600,
      },
    }),
  );
  await page.route('**/api/auth/mfa/enable', (route) =>
    route.fulfill({ json: { recoveryCodes: ['ABCDE-FGHIJ', 'KLMNO-PQRST'] } }),
  );
  await page.goto('/platform/auth/security');
  await page.getByLabel('Confirma tu contraseña actual').fill('ValidPassword1!');
  await page.getByRole('button', { name: 'Configurar autenticador', exact: true }).click();
  await expect(
    page.getByRole('img', { name: 'QR para configurar el autenticador de Cashly' }),
  ).toBeVisible();
  await page.screenshot({ path: 'output/playwright/mfa/setup-desktop.png', fullPage: true });
  await page.getByLabel('Código de seis dígitos').fill('123456');
  await page.getByRole('button', { name: 'Confirmar y activar MFA', exact: true }).click();
  await expect(page.getByText('ABCDE-FGHIJ', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Ya los guardé. Iniciar sesión', exact: true }).click();
  await expect(page).toHaveURL(/\/platform\/auth\/login$/);
  expect(await page.evaluate(() => localStorage.getItem('accessToken'))).toBeNull();
});

test('disabling MFA requires password and second factor then ends the old session', async ({
  page,
}) => {
  await authenticate(page);
  await page.route('**/api/auth/mfa', (route) =>
    route.fulfill({ json: { enabled: true, recoveryCodesRemaining: 2 } }),
  );
  let submitted: unknown;
  await page.route('**/api/auth/mfa/disable', async (route) => {
    submitted = route.request().postDataJSON();
    await route.fulfill({ status: 204 });
  });
  await page.goto('/platform/auth/security');
  await page.getByLabel('Contraseña actual', { exact: true }).fill('ValidPassword1!');
  await page.getByLabel('Código del autenticador o código de recuperación').fill('ABCDE-FGHIJ');
  await page.getByRole('button', { name: 'Desactivar MFA', exact: true }).click();
  await expect(page).toHaveURL(/\/platform\/auth\/login$/);
  expect(submitted).toEqual({ password: 'ValidPassword1!', code: 'ABCDE-FGHIJ' });
  expect(await page.evaluate(() => localStorage.getItem('accessToken'))).toBeNull();
});
