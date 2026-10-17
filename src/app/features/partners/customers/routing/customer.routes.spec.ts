import { describe, it, expect } from 'vitest';
import { CUSTOMER_ROUTES } from '@features/partners/customers/routing/customer.routes';
import { BusinessModule } from '@features/users/models/enums/business-module.enum';

describe('Customer Routes', () => {
  it('should have a parent route with children', () => {
    expect(CUSTOMER_ROUTES).toHaveLength(1);
    expect(CUSTOMER_ROUTES[0].children).toBeDefined();
  });

  it('should have 5 child routes', () => {
    expect(CUSTOMER_ROUTES[0].children).toHaveLength(5);
  });

  it('should have auth guards on parent route', () => {
    expect(CUSTOMER_ROUTES[0].canActivate).toHaveLength(2);
  });

  it('should have SALES module data', () => {
    expect(CUSTOMER_ROUTES[0].data).toEqual({ module: BusinessModule.SALES });
  });

  it('should have list route as default child', () => {
    const listRoute = CUSTOMER_ROUTES[0].children?.find((r) => r.path === '');
    expect(listRoute).toBeDefined();
    expect(listRoute?.title).toBe('Clientes');
  });

  it('should have new customer route', () => {
    const newRoute = CUSTOMER_ROUTES[0].children?.find((r) => r.path === 'new');
    expect(newRoute).toBeDefined();
    expect(newRoute?.title).toBe('Nuevo Cliente');
  });

  it('should have detail route', () => {
    const detailRoute = CUSTOMER_ROUTES[0].children?.find((r) => r.path === ':id');
    expect(detailRoute).toBeDefined();
    expect(detailRoute?.title).toBe('Detalles del Cliente');
  });

  it('should have edit route', () => {
    const editRoute = CUSTOMER_ROUTES[0].children?.find((r) => r.path === ':id/edit');
    expect(editRoute).toBeDefined();
    expect(editRoute?.title).toBe('Editar Cliente');
  });

  it('should use lazy loading for all children', () => {
    CUSTOMER_ROUTES[0].children?.forEach((child) => {
      expect(child.loadComponent).toBeDefined();
    });
  });
});
