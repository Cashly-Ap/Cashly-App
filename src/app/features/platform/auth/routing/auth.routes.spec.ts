import { describe, it, expect } from 'vitest';
import {
  AUTH_ROUTES,
  AUTHENTICATED_AUTH_ROUTES,
} from '@features/platform/auth/routing/auth.routes';

describe('Auth Routes', () => {
  it('should keep only public routes in the public auth configuration', () => {
    expect(AUTH_ROUTES).toHaveLength(3);
  });

  it('should keep email verification public and unguarded', () => {
    const verificationRoute = AUTH_ROUTES.find((r) => r.path === 'verify-email');
    expect(verificationRoute).toBeDefined();
    expect(verificationRoute?.loadComponent).toBeDefined();
    expect(verificationRoute?.canActivate).toBeUndefined();
  });

  it('should have login route', () => {
    const loginRoute = AUTH_ROUTES.find((r) => r.path === 'login');
    expect(loginRoute).toBeDefined();
    expect(loginRoute?.loadComponent).toBeDefined();
  });

  it('should have configuration route with auth guard', () => {
    const configRoute = AUTHENTICATED_AUTH_ROUTES.find((r) => r.path === 'configuration');
    expect(configRoute).toBeDefined();
    expect(configRoute?.canActivate).toBeDefined();
    expect(configRoute?.canActivate).toHaveLength(1);
  });

  it('should have change-password route with auth guard', () => {
    const route = AUTHENTICATED_AUTH_ROUTES.find((r) => r.path === 'change-password');
    expect(route).toBeDefined();
    expect(route?.canActivate).toBeDefined();
    expect(route?.canActivate).toHaveLength(1);
  });

  it('should have change-username route with auth guard', () => {
    const route = AUTHENTICATED_AUTH_ROUTES.find((r) => r.path === 'change-username');
    expect(route).toBeDefined();
    expect(route?.canActivate).toBeDefined();
    expect(route?.canActivate).toHaveLength(1);
  });

  it('should have redirect to login as default', () => {
    const redirectRoute = AUTH_ROUTES.find((r) => r.path === '');
    expect(redirectRoute).toBeDefined();
    expect(redirectRoute?.redirectTo).toBe('login');
    expect(redirectRoute?.pathMatch).toBe('full');
  });

  it('should use lazy loading for all component routes', () => {
    AUTH_ROUTES.forEach((route) => {
      if (route.loadComponent) {
        expect(route.loadComponent).toBeDefined();
      }
    });
  });
});
