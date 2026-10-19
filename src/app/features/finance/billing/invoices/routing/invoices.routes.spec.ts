import { describe, it, expect } from 'vitest';
import { INVOICE_ROUTES } from '@features/finance/billing/invoices/routing/invoices.routes';

describe('Invoice Routes', () => {
  it('should have a parent route with children', () => {
    expect(INVOICE_ROUTES).toHaveLength(1);
    expect(INVOICE_ROUTES[0].children).toBeDefined();
  });

  it('should have 4 child routes', () => {
    expect(INVOICE_ROUTES[0].children).toHaveLength(4);
  });

  it('should have auth guards on parent route', () => {
    expect(INVOICE_ROUTES[0].canActivate).toHaveLength(2);
  });

  it('should have FINANCES module data', () => {
    expect(INVOICE_ROUTES[0].data).toEqual({ module: 'FINANCES' });
  });

  it('should have list route as default child', () => {
    const listRoute = INVOICE_ROUTES[0].children?.find((r) => r.path === '');
    expect(listRoute).toBeDefined();
    expect(listRoute?.title).toBe('Facturas');
  });

  it('should have new invoice route', () => {
    const newRoute = INVOICE_ROUTES[0].children?.find((r) => r.path === 'new');
    expect(newRoute).toBeDefined();
    expect(newRoute?.title).toBe('Nueva Factura');
  });

  it('should have edit invoice route', () => {
    const editRoute = INVOICE_ROUTES[0].children?.find((r) => r.path === ':id/edit');
    expect(editRoute).toBeDefined();
    expect(editRoute?.title).toBe('Editar Factura');
  });

  it('should have detail route', () => {
    const detailRoute = INVOICE_ROUTES[0].children?.find((r) => r.path === ':id');
    expect(detailRoute).toBeDefined();
    expect(detailRoute?.title).toBe('Detalle de Factura');
  });

  it('should use lazy loading for all children', () => {
    INVOICE_ROUTES[0].children?.forEach((child) => {
      expect(child.loadComponent).toBeDefined();
    });
  });
  it('keeps list read independent and guards stock-rich detail and forms', () => {
    expect(
      INVOICE_ROUTES[0].children?.find((route) => route.path === '')?.data?.['requiredPermissions'],
    ).toBeUndefined();
    expect(
      INVOICE_ROUTES[0].children?.find((route) => route.path === ':id')?.data?.[
        'requiredPermissions'
      ],
    ).toEqual(['INVENTORY:READ']);
    expect(
      INVOICE_ROUTES[0].children?.find((route) => route.path === 'new')?.data?.[
        'requiredPermissions'
      ],
    ).toEqual(['INVENTORY:EXECUTE']);
    expect(
      INVOICE_ROUTES[0].children?.find((route) => route.path === ':id/edit')?.data?.[
        'requiredPermissions'
      ],
    ).toEqual(['INVENTORY:EXECUTE']);
  });
});
