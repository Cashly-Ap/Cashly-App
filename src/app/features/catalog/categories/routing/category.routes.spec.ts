import { describe, it, expect } from 'vitest';
import { CATEGORY_ROUTES } from '@features/catalog/categories/routing/category.routes';
import { BusinessModule } from '@features/users/models/enums/business-module.enum';

describe('Category Routes', () => {
  it('should have a parent route with children', () => {
    expect(CATEGORY_ROUTES).toHaveLength(1);
    expect(CATEGORY_ROUTES[0].children).toBeDefined();
  });

  it('should have 4 child routes', () => {
    expect(CATEGORY_ROUTES[0].children).toHaveLength(4);
  });

  it('should have auth guards on parent route', () => {
    expect(CATEGORY_ROUTES[0].canActivate).toHaveLength(2);
  });

  it('should have INVENTORY module data', () => {
    expect(CATEGORY_ROUTES[0].data).toEqual({ module: BusinessModule.INVENTORY });
  });

  it('should have list route as default child', () => {
    const listRoute = CATEGORY_ROUTES[0].children?.find((r) => r.path === '');
    expect(listRoute).toBeDefined();
    expect(listRoute?.title).toBe('Categorías');
  });

  it('should have new category route', () => {
    const newRoute = CATEGORY_ROUTES[0].children?.find((r) => r.path === 'new');
    expect(newRoute).toBeDefined();
    expect(newRoute?.title).toBe('Nueva Categoría');
  });

  it('should have detail route', () => {
    const detailRoute = CATEGORY_ROUTES[0].children?.find((r) => r.path === ':id');
    expect(detailRoute).toBeDefined();
    expect(detailRoute?.title).toBe('Detalles de Categoría');
  });

  it('should have edit route', () => {
    const editRoute = CATEGORY_ROUTES[0].children?.find((r) => r.path === ':id/edit');
    expect(editRoute).toBeDefined();
    expect(editRoute?.title).toBe('Editar Categoría');
  });

  it('should use lazy loading for all children', () => {
    CATEGORY_ROUTES[0].children?.forEach((child) => {
      expect(child.loadComponent).toBeDefined();
    });
  });
});
