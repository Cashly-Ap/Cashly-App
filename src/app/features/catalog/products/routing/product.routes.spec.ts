import { describe, it, expect } from 'vitest';
import { PRODUCT_ROUTES } from '@features/catalog/products/routing/product.routes';
import { BusinessModule } from '@features/users/models/enums/business-module.enum';

describe('Product Routes', () => {
  it('should have a parent route with children', () => {
    expect(PRODUCT_ROUTES).toHaveLength(1);
    expect(PRODUCT_ROUTES[0].children).toBeDefined();
  });

  it('should have 4 child routes', () => {
    expect(PRODUCT_ROUTES[0].children).toHaveLength(4);
  });

  it('should have auth guards on parent route', () => {
    expect(PRODUCT_ROUTES[0].canActivate).toHaveLength(2);
  });

  it('should have INVENTORY module data', () => {
    expect(PRODUCT_ROUTES[0].data).toEqual({ module: BusinessModule.INVENTORY });
  });

  it('should have list route as default child', () => {
    const listRoute = PRODUCT_ROUTES[0].children?.find((r) => r.path === '');
    expect(listRoute).toBeDefined();
    expect(listRoute?.title).toBe('Productos');
  });

  it('should have new product route', () => {
    const newRoute = PRODUCT_ROUTES[0].children?.find((r) => r.path === 'new');
    expect(newRoute).toBeDefined();
    expect(newRoute?.title).toBe('Nuevo Producto');
  });

  it('should have detail route', () => {
    const detailRoute = PRODUCT_ROUTES[0].children?.find((r) => r.path === ':id');
    expect(detailRoute).toBeDefined();
    expect(detailRoute?.title).toBe('Detalles de Producto');
  });

  it('should have edit route', () => {
    const editRoute = PRODUCT_ROUTES[0].children?.find((r) => r.path === ':id/edit');
    expect(editRoute).toBeDefined();
    expect(editRoute?.title).toBe('Editar Producto');
  });

  it('should use lazy loading for all children', () => {
    PRODUCT_ROUTES[0].children?.forEach((child) => {
      expect(child.loadComponent).toBeDefined();
    });
  });
});
