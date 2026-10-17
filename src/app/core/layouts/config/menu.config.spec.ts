import { describe, expect, it, vi } from 'vitest';
import { MenuItem } from '@core/layouts/models';
import { buildMenuItems, MenuCallbacks } from '@app/core/layouts/config/menu.config';

function createCallbacks(): MenuCallbacks {
  return {
    openCatalogModal: vi.fn(),
    openCommercialCatalogModal: vi.fn(),
    openStockModal: vi.fn(),
    openMovementsModal: vi.fn(),
    openOrdersPdfModal: vi.fn(),
    openInvoicesPdfModal: vi.fn(),
    openQuotesPdfModal: vi.fn(),
    openAccountsReceivablePdfModal: vi.fn(),
    openCashRegisterModal: vi.fn(),
    openPurchasesPdfModal: vi.fn(),
  };
}

function flatten(items: MenuItem[]): MenuItem[] {
  return items.flatMap((item) => [item, ...flatten(item.children ?? [])]);
}

function depth(items: MenuItem[]): number {
  return items.length ? Math.max(...items.map((item) => 1 + depth(item.children ?? []))) : 0;
}

describe('ERP navigation', () => {
  it('should order business areas by the operational workflow', () => {
    expect(buildMenuItems(createCallbacks()).map((item) => item.label)).toEqual([
      'Dashboard',
      'Ventas',
      'Compras',
      'Inventario',
      'Finanzas',
      'Reportes',
      'Administración',
    ]);
  });

  it('should group sales documents, inventory and finance with at most three levels', () => {
    const menu = buildMenuItems(createCallbacks());
    expect(
      menu.find((item) => item.label === 'Ventas')?.children?.map((item) => item.label),
    ).toEqual(['Clientes', 'Documentos de venta', 'Tipos de precios']);
    expect(
      menu.find((item) => item.label === 'Inventario')?.children?.map((item) => item.label),
    ).toEqual(['Catálogo', 'Logística']);
    expect(
      menu.find((item) => item.label === 'Finanzas')?.children?.map((item) => item.label),
    ).toEqual(['Tesorería', 'Cartera', 'Ajustes documentales', 'Configuración']);
    expect(depth(menu)).toBeLessThanOrEqual(3);
  });

  it('should preserve every destination exactly once and expose existing cash history', () => {
    const routes = flatten(buildMenuItems(createCallbacks())).flatMap((item) =>
      item.routerLink ? [item.routerLink] : [],
    );
    expect(routes.sort()).toEqual(
      [
        '/dashboard',
        '/customers',
        '/quotes',
        '/orders',
        '/invoices',
        '/price-types',
        '/suppliers',
        '/purchases',
        '/products',
        '/categories',
        '/warehouses',
        '/cash-register',
        '/cash-register/history',
        '/receivables',
        '/credit-notes',
        '/debit-notes',
        '/returns',
        '/payment-methods',
        '/users',
      ].sort(),
    );
    expect(new Set(routes).size).toBe(routes.length);
  });

  it('should preserve every report action exactly once', () => {
    const callbacks = createCallbacks();
    const actions = flatten(buildMenuItems(callbacks)).filter((item) => item.command);
    expect(actions).toHaveLength(10);
    actions.forEach((item) => item.command?.());
    Object.values(callbacks).forEach((callback) => expect(callback).toHaveBeenCalledOnce());
  });
});
