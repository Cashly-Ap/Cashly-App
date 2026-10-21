import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { currentAccessFixture, allAccessModules } from './access.fixture';

const image = readFileSync('e2e/fixtures/branding.png');
const originalCompany = {
  id: 'installation',
  legalName: 'Cashly',
  tradeName: null,
  taxId: null,
  email: null,
  phone: null,
  website: null,
  address: { street: null, city: null, region: null, country: null, postalCode: null },
  logoPath: null,
};
const user = {
  id: 'company-user',
  userName: 'Brand Admin',
  firstName: 'Brand',
  lastName: 'Admin',
  email: 'branding@example.com',
  type: 'SUPER_ADMIN',
  role: 'SUPER_ADMIN',
  active: true,
  photoPath: null,
  address: null,
  phone: null,
  roleId: 'role-e2e',
  departmentId: 'department-e2e',
};

async function setup(page: Page, canEdit = true) {
  await page.addInitScript(
    ({ user }) => {
      localStorage.setItem('theme', 'light');
      localStorage.setItem('accessToken', 'test-access');
      localStorage.setItem('refreshToken', 'test-refresh');
      if (!localStorage.getItem('currentUser'))
        localStorage.setItem('currentUser', JSON.stringify(user));
    },
    { user },
  );
  await page.route('**/api/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({
      json: path.endsWith('/auth/access')
        ? currentAccessFixture(canEdit ? [...allAccessModules, 'COMPANY'] : ['DASHBOARD'], canEdit)
        : path.endsWith('/unread-count')
          ? 0
          : path.endsWith('/summary')
            ? { monthlySales: 0, pendingOrders: 0, overdueReceivables: 0, lowStockProducts: 0 }
            : [],
    });
  });
  await page.route('**/api/auth/profile', (route) =>
    route.fulfill({
      json: {
        ...user,
        ...(route.request().method() === 'PUT' ? route.request().postDataJSON() : {}),
      },
    }),
  );
  await page.route('**/api/company', (route) => route.fulfill({ json: originalCompany }));
}

test('company information and uploaded logo update the navbar without reload loops', async ({
  page,
}) => {
  await setup(page);
  let company = { ...originalCompany };
  let logoReads = 0;
  await page.route('**/api/company', (route) => {
    if (route.request().method() === 'PUT')
      company = { ...company, ...route.request().postDataJSON() };
    return route.fulfill({ json: company });
  });
  await page.route('**/api/company/logo', (route) => {
    if (route.request().method() === 'GET') {
      logoReads++;
      return route.fulfill({ body: image, contentType: 'image/png' });
    }
    company = {
      ...company,
      logoPath: route.request().method() === 'DELETE' ? null : 'company/uploaded.png',
    } as typeof company;
    return route.fulfill({ json: company });
  });
  await page.goto('/platform/company/edit');
  await expect(page.getByRole('heading', { name: 'Editar empresa' })).toBeVisible();
  await page.getByLabel('Razón social', { exact: true }).fill('Empresa de ejemplo SL');
  await page.getByLabel('Nombre comercial', { exact: true }).fill('Mi Empresa');
  await page.getByLabel('NIF / CIF', { exact: true }).fill('B12345678');
  await page.locator('input[type=file]').first().setInputFiles('e2e/fixtures/branding.png');
  await page.getByRole('button', { name: /Guardar cambios/ }).click();
  await expect(page.locator('.cashly-brand img')).toHaveAttribute('src', /^blob:/);
  await expect(page.locator('.cashly-brand')).toHaveAttribute('aria-label', 'Mi Empresa');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'output/playwright/company/settings-desktop.png' });
  await page.reload();
  await expect(page.locator('.cashly-brand img')).toHaveAttribute('src', /^blob:/);
  expect(logoReads).toBeLessThanOrEqual(6);
});

test('mobile settings retain the shared panel and original logo fallback', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page);
  await page.goto('/platform/company/edit');
  await expect(page.locator('.cashly-brand img')).toHaveAttribute('src', '/cashly-icon.svg');
  await expect(page.locator('app-form-card .cashly-panel')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'output/playwright/company/settings-mobile.png', fullPage: true });
});

test('company editing is inaccessible without its administrative permission', async ({ page }) => {
  await setup(page, false);
  await page.goto('/platform/company/edit');
  await expect(page).not.toHaveURL(/\/platform\/company$/);
});

test('country selection searches world countries, shows flags and preserves existing names', async ({
  page,
}) => {
  await setup(page);
  let savedCountry: string | null = null;
  await page.route('**/api/company', (route) => {
    const company = {
      ...originalCompany,
      address: { ...originalCompany.address, country: 'Spain' },
    };
    if (route.request().method() === 'PUT')
      savedCountry = route.request().postDataJSON().address.country;
    return route.fulfill({ json: company });
  });
  await page.goto('/platform/company/edit');
  await page.getByRole('tab', { name: /Dirección fiscal/ }).click();
  const select = page.getByRole('combobox', { name: 'País', exact: true });
  await expect(select).toContainText('España');
  await expect(select.locator('img')).toHaveAttribute('src', '/flags/es.svg');
  await select.click();
  await expect(page.getByRole('option')).toHaveCount(250);
  await page.getByPlaceholder('Buscar país…').fill('Venezuela');
  await expect(page.getByRole('option')).toHaveCount(1);
  await expect(page.getByRole('option').locator('img')).toHaveAttribute('src', '/flags/ve.svg');
  await expect
    .poll(() =>
      page
        .getByRole('option')
        .locator('img')
        .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0),
    )
    .toBe(true);
  await page.screenshot({ path: 'output/playwright/company/country-select.png' });
  await page.getByRole('option', { name: /Venezuela/ }).click();
  await page.getByRole('button', { name: /Guardar cambios/ }).click();
  await expect.poll(() => savedCountry).toBe('Venezuela');
});

test('removing the company logo restores the current Cashly icon', async ({ page }) => {
  await setup(page);
  let company = { ...originalCompany, logoPath: 'company/old.png' as string | null };
  await page.route('**/api/company', (route) => route.fulfill({ json: company }));
  await page.route('**/api/company/logo', (route) => {
    if (route.request().method() === 'GET')
      return route.fulfill({ body: image, contentType: 'image/png' });
    company = { ...company, logoPath: null };
    return route.fulfill({ json: company });
  });
  await page.goto('/platform/company/edit');
  await expect(page.locator('.cashly-brand img')).toHaveAttribute('src', /^blob:/);
  await page.getByRole('button', { name: 'Eliminar imagen', exact: true }).click();
  await page.getByRole('button', { name: /Guardar cambios/ }).click();
  await expect(page.locator('.cashly-brand img')).toHaveAttribute('src', '/cashly-icon.svg');
});

test('country flags and search fit the mobile form', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page);
  await page.goto('/platform/company/edit');
  await page.getByRole('tab', { name: /Dirección fiscal/ }).click();
  await page.getByRole('combobox', { name: 'País', exact: true }).click();
  await page.getByPlaceholder('Buscar país…').fill('Japón');
  await expect(page.getByRole('option').locator('img')).toHaveAttribute('src', '/flags/jp.svg');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'output/playwright/company/country-select-mobile.png' });
});

test('own profile photo upload updates the navbar and survives reload', async ({ page }) => {
  await setup(page);
  let photoPath: string | null = null;
  await page.route('**/api/auth/profile', (route) =>
    route.fulfill({
      json: {
        ...user,
        photoPath,
        ...(route.request().method() === 'PUT' ? route.request().postDataJSON() : {}),
      },
    }),
  );
  await page.route('**/api/auth/profile/photo', (route) => {
    if (route.request().method() === 'GET')
      return route.fulfill({ body: image, contentType: 'image/png' });
    photoPath = route.request().method() === 'DELETE' ? null : 'users/avatar.png';
    return route.fulfill({ json: { ...user, photoPath } });
  });
  await page.goto('/platform/auth/change-username');
  await expect(page.getByText('Foto de perfil', { exact: true })).toBeVisible();
  await page.locator('input[type=file]').first().setInputFiles('e2e/fixtures/branding.png');
  await page.getByRole('button', { name: /Guardar/ }).click();
  await expect(page).toHaveURL(/\/platform\/auth\/configuration$/);
  await expect(
    page.locator('button[aria-label="Abrir menú de usuario"] app-user-avatar img'),
  ).toHaveAttribute('src', /^blob:/);
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('currentUser') ?? '{}').photoPath),
  ).toBe('users/avatar.png');
  await page.reload();
  await expect(
    page.locator('button[aria-label="Abrir menú de usuario"] app-user-avatar img'),
  ).toHaveAttribute('src', /^blob:/);
  await expect
    .poll(() =>
      page
        .locator('app-user-avatar img')
        .first()
        .evaluate((image) => getComputedStyle(image).objectFit),
    )
    .toBe('cover');
  await page.screenshot({ path: 'output/playwright/company/profile-photo.png', fullPage: true });
});

test('company details precede editing and cancel returns to details', async ({ page }) => {
  await setup(page);
  await page.goto('/platform/company');
  await expect(page.getByRole('heading', { name: 'Detalles de la empresa' })).toBeVisible();
  await expect(page.locator('app-company-details input')).toHaveCount(0);
  await page.getByRole('button', { name: 'Editar empresa', exact: true }).click();
  await expect(page).toHaveURL(/\/platform\/company\/edit$/);
  await page.getByRole('button', { name: /Cancelar/ }).click();
  await expect(page).toHaveURL(/\/platform\/company$/);
  await expect(page.getByRole('heading', { name: 'Detalles de la empresa' })).toBeVisible();
  await page.screenshot({ path: 'output/playwright/company/details-desktop.png', fullPage: true });
});

test('company read permission allows details but prevents editing by direct URL', async ({
  page,
}) => {
  await setup(page, false);
  await page.route('**/api/auth/access', (route) =>
    route.fulfill({
      json: {
        ...currentAccessFixture(['COMPANY'], false),
        permissions: { COMPANY: ['READ'] },
      },
    }),
  );
  await page.goto('/platform/company');
  await expect(page.getByRole('heading', { name: 'Detalles de la empresa' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Editar empresa', exact: true })).toHaveCount(0);
  await page.goto('/platform/company/edit');
  await expect(page).not.toHaveURL(/\/platform\/company\/edit$/);
  await expect(page.getByLabel('Razón social', { exact: true })).toHaveCount(0);
});

test('company can be edited with its own role permission independently of departments', async ({
  page,
}) => {
  await setup(page, false);
  await page.route('**/api/auth/access', (route) =>
    route.fulfill({
      json: {
        ...currentAccessFixture(['COMPANY'], false),
        permissions: { COMPANY: ['READ', 'UPDATE'] },
      },
    }),
  );
  await page.goto('/platform/company');
  await page.getByRole('button', { name: 'Editar empresa', exact: true }).click();
  await expect(page.getByLabel('Razón social', { exact: true })).toBeVisible();
});

test('PDF document logo can be uploaded, previewed and removed independently of the navbar', async ({
  page,
}) => {
  await setup(page);
  let company = {
    ...originalCompany,
    logoPath: 'company/navbar.png',
    pdfLogoPath: null as string | null,
  };
  await page.route('**/api/company', (route) => route.fulfill({ json: company }));
  await page.route('**/api/company/logo', (route) =>
    route.fulfill({ body: image, contentType: 'image/png' }),
  );
  await page.route('**/api/company/pdf-logo', (route) => {
    if (route.request().method() === 'GET')
      return route.fulfill({ body: image, contentType: 'image/png' });
    company = {
      ...company,
      pdfLogoPath: route.request().method() === 'DELETE' ? null : 'company/pdf.png',
    };
    return route.fulfill({ json: company });
  });
  await page.goto('/platform/company/edit');
  const pdfLogo = page.locator('app-file-input').filter({ hasText: 'Logotipo de documentos PDF' });
  await expect(pdfLogo).toBeVisible();
  await pdfLogo.locator('input[type=file]').setInputFiles('e2e/fixtures/branding.png');
  await page.getByRole('button', { name: /Guardar cambios/ }).click();
  await expect(page).toHaveURL(/\/platform\/company$/);
  expect(company.logoPath).toBe('company/navbar.png');
  expect(company.pdfLogoPath).toBe('company/pdf.png');
  await page.getByRole('button', { name: 'Editar empresa', exact: true }).click();
  await expect(pdfLogo.getByAltText('Vista previa')).toHaveAttribute('src', /^blob:/);
  await page.screenshot({ path: 'output/playwright/company/pdf-logo.png', fullPage: true });
  await pdfLogo.getByRole('button', { name: 'Eliminar imagen', exact: true }).click();
  await page.getByRole('button', { name: /Guardar cambios/ }).click();
  await expect.poll(() => company.pdfLogoPath).toBeNull();
  expect(company.logoPath).toBe('company/navbar.png');
  await expect(page.locator('.cashly-brand img')).toHaveAttribute('src', /^blob:/);
});

test('PDF preview uses pending uploads before saving and closing releases its object URL', async ({
  page,
}) => {
  await setup(page);
  const mutations: string[] = [];
  await page.route('**/api/company**', async (route) => {
    if (route.request().method() !== 'GET') mutations.push(new URL(route.request().url()).pathname);
    if (route.request().url().endsWith('/pdf-logo/preview')) {
      expect(route.request().postDataBuffer()?.toString()).toContain('name="file"');
      return route.fulfill({
        contentType: 'application/pdf',
        body: readFileSync(process.env['PDF_PREVIEW_FIXTURE'] || 'docs/Desarrollo.pdf'),
      });
    }
    return route.fulfill({ json: originalCompany });
  });
  await page.goto('/platform/company/edit');
  const pdfLogo = page.locator('app-file-input').filter({ hasText: 'Logotipo de documentos PDF' });
  await pdfLogo.locator('input[type=file]').setInputFiles('e2e/fixtures/branding.png');
  await page.getByRole('button', { name: 'Vista previa PDF', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Vista previa del logotipo en PDF' });
  await expect(dialog.locator('iframe')).toHaveAttribute('src', /^blob:/);
  const url = await dialog.locator('iframe').getAttribute('src');
  await page.screenshot({ path: 'output/playwright/company/pdf-logo-preview.png', fullPage: true });
  await dialog.getByRole('button', { name: /cerrar|close/i }).click();
  await expect(dialog).toBeHidden();
  expect(
    await page.evaluate(async (url) => {
      try {
        await fetch(url!);
        return true;
      } catch {
        return false;
      }
    }, url),
  ).toBe(false);
  expect(mutations).toEqual(['/api/company/pdf-logo/preview']);
  await expect(pdfLogo.getByAltText('Vista previa')).toBeVisible();
});

test('PDF preview shows loading, allows cancellation and recovers after invalid-image errors', async ({
  page,
}) => {
  await setup(page);
  let attempts = 0;
  await page.route('**/api/company/pdf-logo/preview', async (route) => {
    attempts++;
    if (attempts === 1) await new Promise((resolve) => setTimeout(resolve, 1200));
    return route.fulfill({ status: 400, json: { message: 'Invalid image' } });
  });
  await page.goto('/platform/company/edit');
  const button = page.getByRole('button', { name: 'Vista previa PDF', exact: true });
  await button.click();
  const dialog = page.getByRole('dialog', { name: 'Vista previa del logotipo en PDF' });
  await expect(dialog.locator('p-progressspinner')).toBeVisible();
  await dialog.getByRole('button', { name: /cerrar|close/i }).click();
  await expect(dialog).toBeHidden();
  await expect(button).toBeEnabled();
  await button.click();
  await expect(
    page.getByText('No se pudo generar la vista previa', { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByText(/Usa una imagen PNG o JPG válida/).first()).toBeVisible();
  await expect(dialog).toBeHidden();
  await expect(button).toBeEnabled();
});

test('company accepts a PNG larger than 5 MB and sends a smaller image with preserved ratio', async ({
  page,
}) => {
  await setup(page);
  let uploadedSize = 0;
  await page.route('**/api/company/pdf-logo/preview', (route) => {
    uploadedSize = route.request().postDataBuffer()?.length ?? 0;
    return route.fulfill({
      contentType: 'application/pdf',
      body: readFileSync('docs/Desarrollo.pdf'),
    });
  });
  await page.goto('/platform/company/edit');
  const large = await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 3000;
    canvas.height = 1500;
    canvas.getContext('2d')!.fillRect(0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((blob) => resolve(blob!), 'image/png'),
    );
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const padded = new Uint8Array(6000000);
    padded.set(bytes);
    let binary = '';
    for (let offset = 0; offset < padded.length; offset += 32768)
      binary += String.fromCharCode(...padded.subarray(offset, offset + 32768));
    return btoa(binary);
  });
  const pdfLogo = page.locator('app-file-input').filter({ hasText: 'Logotipo de documentos PDF' });
  await pdfLogo
    .locator('input[type=file]')
    .setInputFiles({
      name: 'large-logo.png',
      mimeType: 'image/png',
      buffer: Buffer.from(large, 'base64'),
    });
  const preview = pdfLogo.getByAltText('Vista previa');
  await expect(preview).toBeVisible();
  await expect
    .poll(() =>
      preview.evaluate((image: HTMLImageElement) => [image.naturalWidth, image.naturalHeight]),
    )
    .toEqual([2048, 1024]);
  await expect(page.getByText(/Invalid file size/)).toHaveCount(0);
  await page.getByRole('button', { name: 'Vista previa PDF', exact: true }).click();
  await expect.poll(() => uploadedSize).toBeGreaterThan(0);
  expect(uploadedSize).toBeLessThan(6000000);
});
