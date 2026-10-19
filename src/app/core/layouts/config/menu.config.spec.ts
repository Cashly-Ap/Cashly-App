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
      'Ventas',
      'Compras',
      'Catálogo',
      'Inventario',
      'Finanzas',
      'Contactos',
      'Análisis',
      'Plataforma',
    ]);
  });

  it('should group sales documents, inventory and finance with at most four levels', () => {
    const menu = buildMenuItems(createCallbacks());
    expect(
      menu.find((item) => item.label === 'Ventas')?.children?.map((item) => item.label),
    ).toEqual(['Presupuestos', 'Pedidos', 'Reportes']);
    expect(
      menu.find((item) => item.label === 'Inventario')?.children?.map((item) => item.label),
    ).toEqual(['Almacenes', 'Reportes']);
    expect(
      menu.find((item) => item.label === 'Finanzas')?.children?.map((item) => item.label),
    ).toEqual(['Facturación', 'Tesorería']);
    expect(depth(menu)).toBeLessThanOrEqual(4);
  });

  it('should preserve every destination exactly once and expose existing cash history', () => {
    const routes = flatten(buildMenuItems(createCallbacks())).flatMap((item) =>
      item.routerLink ? [item.routerLink] : [],
    );
    expect(routes.sort()).toEqual(
      [
        '/analytics/dashboard',
        '/partners/customers',
        '/sales/quotes',
        '/sales/orders',
        '/finance/billing/invoices',
        '/catalog/price-types',
        '/partners/suppliers',
        '/procurement/purchases',
        '/catalog/products',
        '/catalog/categories',
        '/inventory/warehouses',
        '/finance/treasury/cash-register',
        '/finance/treasury/cash-register/history',
        '/finance/treasury/receivables',
        '/finance/billing/credit-notes',
        '/finance/billing/debit-notes',
        '/finance/billing/returns',
        '/finance/treasury/payment-methods',
        '/platform/users',
        '/platform/roles',
        '/platform/departments',
        '/platform/auth/configuration',
        '/analytics/reports/inventory',
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
