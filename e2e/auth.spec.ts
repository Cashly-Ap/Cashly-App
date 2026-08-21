import { expect, test } from '@playwright/test';

test.describe('Back-office authentication entry point', () => {
  test('renders the login form for an unauthenticated visitor', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar Sesión' })).toBeDisabled();
  });

  test('redirects protected routes to the login page without a session', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
  });
});
