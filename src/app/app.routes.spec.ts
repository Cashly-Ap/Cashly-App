import { routes } from '@app/app.routes';
import { describe, expect, it } from 'vitest';

describe('application routes', () => {
  it('keeps public authentication outside the persistent application shell', () => {
    const authRoute = routes.find((route) => route.path === 'auth');
    const shellRoute = routes.find((route) => route.path === '' && route.children);

    expect(authRoute?.loadChildren).toBeDefined();
    expect(shellRoute?.loadComponent).toBeDefined();
    expect(shellRoute?.children?.some((route) => route.path === 'dashboard')).toBe(true);
    expect(shellRoute?.children?.some((route) => route.path === 'users')).toBe(true);
  });

  it('loads the main layout lazily only for authenticated screens', async () => {
    const shellRoute = routes.find((route) => route.path === '' && route.children);

    const shellComponent = await shellRoute?.loadComponent?.();

    expect(shellComponent?.name).toBe('MainLayoutComponent');
  });
});
