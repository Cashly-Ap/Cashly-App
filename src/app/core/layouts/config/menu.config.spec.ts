import { LIST_NAVIGATION_DEFINITIONS } from './list-navigation.config';
import { describe, expect, it, vi } from 'vitest';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { MenuItem } from '@core/layouts/models';
import { buildMenuItems, MenuCallbacks } from '@app/core/layouts/config/menu.config';

function createCallbacks(): MenuCallbacks {
  return {
    openListAction: vi.fn(),
    openCustomerEditPicker: vi.fn(),
    openCustomerBalancePicker: vi.fn(),
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
    expect(routes.filter((route) => !route.endsWith('/new')).sort()).toEqual(
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
        '/analytics/reports/inventory',
      ].sort(),
    );
    expect(new Set(routes).size).toBe(routes.length);
  });

  it('should preserve every report action exactly once', () => {
    const callbacks = createCallbacks();
    const { openListAction, openCustomerEditPicker, openCustomerBalancePicker, ...reports } =
      callbacks;
    const actions = flatten(buildMenuItems(callbacks)).filter((item) =>
      Object.values(reports).some((callback) => callback === item.command),
    );
    expect(actions).toHaveLength(10);
    actions.forEach((item) => item.command?.());
    Object.values(reports).forEach((callback) => expect(callback).toHaveBeenCalledOnce());
  });
  it('assigns every report action its business owner and exact EXPORT action', () => {
    const reports = flatten(buildMenuItems(createCallbacks())).filter(
      (item) => item.requiredAction === 'EXPORT',
    );
    for (const item of reports) {
      expect(item.requiredModule).toBeDefined();
      expect(item.requiredAction).toBe('EXPORT');
    }
  });
  it('does not expose delete actions in the navbar', () => {
    const items = flatten(buildMenuItems(createCallbacks()));
    expect(
      items.some((item) => item.requiredAction === 'DELETE' || /eliminar|borrar/i.test(item.label)),
    ).toBe(false);
  });

  it('exposes every list action and create destination', () => {
    const callbacks = createCallbacks();
    const items = flatten(buildMenuItems(callbacks));
    items.filter((item) => item.command).forEach((item) => item.command?.());
    for (const definition of LIST_NAVIGATION_DEFINITIONS) {
      if (definition.create)
        expect(
          items.some(
            (item) =>
              item.routerLink === `${definition.route}/new` && item.requiredAction === 'CREATE',
          ),
        ).toBe(true);
      for (const action of definition.actions) {
        if (definition.route === '/partners/customers' && action.label === 'Editar') {
          expect(callbacks.openCustomerEditPicker).toHaveBeenCalledOnce();
        } else if (definition.route === '/partners/customers' && action.label === 'Ver saldo') {
          expect(callbacks.openCustomerBalancePicker).toHaveBeenCalledOnce();
        } else {
          expect(callbacks.openListAction).toHaveBeenCalledWith(
            definition.route,
            action.label,
            action.queryParams,
          );
        }
      }
    }
  });

  it('uses inventory export for the inventory catalog report and catalog export for the commercial catalog', () => {
    const callbacks = createCallbacks();
    const items = flatten(buildMenuItems(callbacks));
    expect(items.find((item) => item.command === callbacks.openCatalogModal)?.requiredModule).toBe(
      BusinessModule.INVENTORY,
    );
    expect(
      items.find((item) => item.command === callbacks.openCommercialCatalogModal)?.requiredModule,
    ).toBe(BusinessModule.CATALOG);
  });
});
