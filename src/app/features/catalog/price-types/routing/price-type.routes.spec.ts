import { describe, it, expect } from 'vitest';
import { PRICE_TYPE_ROUTES } from '@features/catalog/price-types/routing/price-type.routes';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

describe('Price Type Routes', () => {
  it('should have a parent route with children', () => {
    expect(PRICE_TYPE_ROUTES).toHaveLength(1);
    expect(PRICE_TYPE_ROUTES[0].children).toBeDefined();
  });

  it('should have 4 child routes', () => {
    expect(PRICE_TYPE_ROUTES[0].children).toHaveLength(4);
  });

  it('should have auth guards on parent route', () => {
    expect(PRICE_TYPE_ROUTES[0].canActivate).toHaveLength(2);
  });

  it('should have CATALOG_PRICES module data', () => {
    expect(PRICE_TYPE_ROUTES[0].data).toEqual({ module: BusinessModule.CATALOG_PRICES });
  });

  it('should have list route as default child', () => {
    const listRoute = PRICE_TYPE_ROUTES[0].children?.find((r) => r.path === '');
    expect(listRoute).toBeDefined();
    expect(listRoute?.title).toBe('Tipos de Precio');
  });

  it('should have new price type route', () => {
    const newRoute = PRICE_TYPE_ROUTES[0].children?.find((r) => r.path === 'new');
    expect(newRoute).toBeDefined();
    expect(newRoute?.title).toBe('Nuevo Tipo de Precio');
  });

  it('should have detail route', () => {
    const detailRoute = PRICE_TYPE_ROUTES[0].children?.find((r) => r.path === ':id');
    expect(detailRoute).toBeDefined();
    expect(detailRoute?.title).toBe('Detalles de Tipo de Precio');
  });

  it('should have edit route', () => {
    const editRoute = PRICE_TYPE_ROUTES[0].children?.find((r) => r.path === ':id/edit');
    expect(editRoute).toBeDefined();
    expect(editRoute?.title).toBe('Editar Tipo de Precio');
  });

  it('should use lazy loading for all children', () => {
    PRICE_TYPE_ROUTES[0].children?.forEach((child) => {
      expect(child.loadComponent).toBeDefined();
    });
  });
});
