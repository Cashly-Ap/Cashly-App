import { describe, it, expect } from 'vitest';
import { ORDER_ROUTES } from '@features/orders/router/orders.routes';

describe('Order Routes', () => {
  it('should have a parent route with children', () => {
    expect(ORDER_ROUTES).toHaveLength(1);
    expect(ORDER_ROUTES[0].children).toBeDefined();
  });

  it('should have 4 child routes', () => {
    expect(ORDER_ROUTES[0].children).toHaveLength(4);
  });

  it('should have auth guards on parent route', () => {
    expect(ORDER_ROUTES[0].canActivate).toHaveLength(2);
  });

  it('should have SALES module data', () => {
    expect(ORDER_ROUTES[0].data).toEqual({ module: 'SALES' });
  });

  it('should have list route as default child', () => {
    const listRoute = ORDER_ROUTES[0].children?.find((r) => r.path === '');
    expect(listRoute).toBeDefined();
    expect(listRoute?.title).toBe('Pedidos');
  });

  it('should have new order route', () => {
    const newRoute = ORDER_ROUTES[0].children?.find((r) => r.path === 'new');
    expect(newRoute).toBeDefined();
    expect(newRoute?.title).toBe('Nuevo Pedido');
  });

  it('should have edit order route', () => {
    const editRoute = ORDER_ROUTES[0].children?.find((r) => r.path === ':id/edit');
    expect(editRoute).toBeDefined();
    expect(editRoute?.title).toBe('Editar Pedido');
  });

  it('should have detail route', () => {
    const detailRoute = ORDER_ROUTES[0].children?.find((r) => r.path === ':id');
    expect(detailRoute).toBeDefined();
    expect(detailRoute?.title).toBe('Detalle del Pedido');
  });

  it('should use lazy loading for all children', () => {
    ORDER_ROUTES[0].children?.forEach((child) => {
      expect(child.loadComponent).toBeDefined();
    });
  });
});
