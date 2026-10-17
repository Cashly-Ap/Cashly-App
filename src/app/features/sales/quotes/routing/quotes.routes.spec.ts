import { describe, it, expect } from 'vitest';
import { QUOTE_ROUTES } from '@features/sales/quotes/routing/quotes.routes';

describe('Quote Routes', () => {
  it('should have a parent route with children', () => {
    expect(QUOTE_ROUTES).toHaveLength(1);
    expect(QUOTE_ROUTES[0].children).toBeDefined();
  });

  it('should have 4 child routes', () => {
    expect(QUOTE_ROUTES[0].children).toHaveLength(4);
  });

  it('should have auth guards on parent route', () => {
    expect(QUOTE_ROUTES[0].canActivate).toHaveLength(2);
  });

  it('should have SALES module data', () => {
    expect(QUOTE_ROUTES[0].data).toEqual({ module: 'SALES' });
  });

  it('should have list route as default child', () => {
    const listRoute = QUOTE_ROUTES[0].children?.find((r) => r.path === '');
    expect(listRoute).toBeDefined();
    expect(listRoute?.title).toBe('Presupuestos');
  });

  it('should have new quote route', () => {
    const newRoute = QUOTE_ROUTES[0].children?.find((r) => r.path === 'new');
    expect(newRoute).toBeDefined();
    expect(newRoute?.title).toBe('Nuevo Presupuesto');
  });

  it('should have edit quote route', () => {
    const editRoute = QUOTE_ROUTES[0].children?.find((r) => r.path === ':id/edit');
    expect(editRoute).toBeDefined();
    expect(editRoute?.title).toBe('Editar Presupuesto');
  });

  it('should have detail route', () => {
    const detailRoute = QUOTE_ROUTES[0].children?.find((r) => r.path === ':id');
    expect(detailRoute).toBeDefined();
    expect(detailRoute?.title).toBe('Detalle del Presupuesto');
  });

  it('should use lazy loading for all children', () => {
    QUOTE_ROUTES[0].children?.forEach((child) => {
      expect(child.loadComponent).toBeDefined();
    });
  });
});
