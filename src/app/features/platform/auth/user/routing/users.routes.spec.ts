import { describe, it, expect } from 'vitest';
import { USER_ROUTES } from '@features/platform/auth/user/routing/users.routes';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

describe('User Routes', () => {
  it('should have a parent route with children', () => {
    expect(USER_ROUTES).toHaveLength(1);
    expect(USER_ROUTES[0].children).toBeDefined();
  });

  it('should have 4 child routes', () => {
    expect(USER_ROUTES[0].children).toHaveLength(4);
  });

  it('should have auth guards on parent route', () => {
    expect(USER_ROUTES[0].canActivate).toHaveLength(2);
  });

  it('should have USERS module data', () => {
    expect(USER_ROUTES[0].data).toEqual({ module: BusinessModule.USERS });
  });

  it('should have list route as default child', () => {
    const listRoute = USER_ROUTES[0].children?.find((r) => r.path === '');
    expect(listRoute).toBeDefined();
    expect(listRoute?.title).toBe('Usuarios');
  });

  it('should have new user route', () => {
    const newRoute = USER_ROUTES[0].children?.find((r) => r.path === 'new');
    expect(newRoute).toBeDefined();
    expect(newRoute?.title).toBe('Nuevo Usuario');
  });

  it('should have detail route', () => {
    const detailRoute = USER_ROUTES[0].children?.find((r) => r.path === ':id');
    expect(detailRoute).toBeDefined();
    expect(detailRoute?.title).toBe('Detalles del Usuario');
  });

  it('should have edit route', () => {
    const editRoute = USER_ROUTES[0].children?.find((r) => r.path === ':id/edit');
    expect(editRoute).toBeDefined();
    expect(editRoute?.title).toBe('Editar Usuario');
  });

  it('should use lazy loading for all children', () => {
    USER_ROUTES[0].children?.forEach((child) => {
      expect(child.loadComponent).toBeDefined();
    });
  });
});
