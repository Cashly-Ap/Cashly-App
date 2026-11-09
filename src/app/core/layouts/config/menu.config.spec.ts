import { LIST_NAVIGATION_DEFINITIONS } from '@core/layouts/config/list-navigation.config';
import { describe, expect, it, vi } from 'vitest';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { AuditPermission } from '@features/platform/audit/permissions';
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
    openCompanyAuditHistory: vi.fn(),
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
    ).toEqual(['Presupuestos', 'Pedidos']);
    expect(
      menu.find((item) => item.label === 'Inventario')?.children?.map((item) => item.label),
    ).toEqual(['Almacenes']);
    expect(
      menu.find((item) => item.label === 'Finanzas')?.children?.map((item) => item.label),
    ).toEqual(['Facturación', 'Tesorería']);
    expect(depth(menu)).toBeLessThanOrEqual(4);
  });

  it('opens a single stock destination directly without an action picker', () => {
    const entries = flatten(buildMenuItems(createCallbacks())).filter(
      (item) => item.label === 'Ver stock',
    );
    expect(entries).toHaveLength(1);
    expect(entries[0].routerLink).toBe('/inventory/warehouses/stock');
    expect(entries[0].command).toBeUndefined();
    const inventory = buildMenuItems(createCallbacks()).find((item) => item.label === 'Inventario');
    expect(
      inventory?.children
        ?.find((item) => item.label === 'Almacenes')
        ?.children?.some((item) => item.label === 'Ver stock'),
    ).toBe(true);
  });

  it('orders every module as list, detail, edit, delete, other actions and reports', () => {
    const all = flatten(buildMenuItems(createCallbacks()));
    for (const definition of LIST_NAVIGATION_DEFINITIONS) {
      const group = all.find((item) =>
        item.children?.some((child) => child.routerLink === definition.route),
      );
      const entries = group?.children ?? [];
      expect(entries[0]?.routerLink).toBe(definition.route);
      const priority = (item: MenuItem) => {
        if (item.label === 'Historial') return 6;
        if (/^Ver detalle|^Ver detalles|^Ver deuda/.test(item.label)) return 0;
        if (item.requiredAction === 'UPDATE') return 1;
        if (item.requiredAction === 'DELETE') return 2;
        if (item.routerLink?.endsWith('/new')) return 3;
        if (
          (item.requiredAction === 'EXPORT' && !item.label.startsWith('Descargar PDF')) ||
          item.label === 'Reportes'
        )
          return 5;
        return 4;
      };
      const ranks = entries.slice(1).map(priority);
      expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    }
  });

  it('keeps cash history inside Caja before its reports', () => {
    const all = flatten(buildMenuItems(createCallbacks()));
    const treasury = all.find((item) => item.label === 'Tesorería');
    expect(treasury?.children?.some((item) => item.label === 'Historial de caja')).toBe(false);
    const cash = treasury?.children?.find((item) => item.label === 'Caja');
    const children = cash?.children ?? [];
    const historyIndex = children.findIndex((item) => item.label === 'Historial de caja');
    expect(historyIndex).toBeGreaterThan(0);
    expect(children[historyIndex].routerLink).toBe('/finance/treasury/cash-register/history');
    expect(historyIndex).toBeLessThan(
      children.findIndex((item) => item.label === 'Reportes de Caja'),
    );
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
        '/inventory/warehouses/stock',
        '/inventory/warehouses/movements',
        '/finance/treasury/cash-register',
        '/finance/treasury/cash-register/history',
        '/finance/treasury/expenses',
        '/finance/treasury/receivables',
        '/finance/billing/credit-notes',
        '/finance/billing/debit-notes',
        '/finance/billing/returns',
        '/finance/treasury/payment-methods',
        '/platform/users',
        '/platform/roles',
        '/platform/departments',
        '/platform/company',
        '/platform/company/edit',
      ].sort(),
    );
    expect(new Set(routes).size).toBe(routes.length);
  });

  it('exposes the company audit history from the menubar', () => {
    const callbacks = createCallbacks();
    const all = flatten(buildMenuItems(callbacks));
    const company = all.find((item) => item.label === 'Compañía');
    const history = company?.children?.find((item) => item.label === 'Historial');
    expect(history?.requiredPermission).toBe(AuditPermission.VIEW_LIST);
    expect(history?.routerLink).toBeUndefined();
    history?.command?.();
    expect(callbacks.openCompanyAuditHistory).toHaveBeenCalledTimes(1);
  });

  it('places reports directly inside their owning module without report groups', () => {
    const menu = buildMenuItems(createCallbacks());
    const all = flatten(menu);
    expect(all.filter((item) => item.label === 'Reportes')).toHaveLength(1);
    const warehouseReports = all
      .find((item) => item.label === 'Almacenes')
      ?.children?.find((item) => item.label === 'Reportes');
    expect(warehouseReports?.children?.map((item) => item.label)).toEqual(['Stock', 'Movimientos']);
    expect(warehouseReports?.children?.every((item) => !!item.command && !item.routerLink)).toBe(
      true,
    );
    expect(all.some((item) => item.routerLink === '/analytics/reports/inventory')).toBe(false);
    for (const [owner, reports] of [
      ['Presupuestos', ['Reporte de Presupuestos PDF']],
      ['Pedidos', ['Reporte de Pedidos PDF']],
      ['Compras', ['Reporte de Compras PDF']],
      ['Productos', ['Reporte de Productos PDF', 'Catálogo Comercial PDF']],
      ['Almacenes', ['Reportes']],
      ['Facturas', ['Reporte de Facturas PDF']],
      ['Caja', ['Reportes de Caja']],
      ['Cuentas por cobrar', ['Cuentas por Cobrar PDF']],
    ] as const) {
      const sections = all.filter((item) => item.label === owner && item.children);
      for (const label of reports)
        expect(
          sections.some((section) => section.children?.some((item) => item.label === label)),
        ).toBe(true);
    }
  });

  it('should preserve every report action exactly once', () => {
    const callbacks = createCallbacks();
    const {
      openListAction,
      openCustomerEditPicker,
      openCustomerBalancePicker,
      openCompanyAuditHistory,
      ...reports
    } = callbacks;
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
  it('exposes delete actions in the navbar for deletable modules', () => {
    const items = flatten(buildMenuItems(createCallbacks()));
    expect(items.filter((item) => item.requiredAction === 'DELETE')).not.toHaveLength(0);
  });

  it('exposes the quote cancel and receivable payment actions in the navbar', () => {
    const items = flatten(buildMenuItems(createCallbacks()));
    for (const label of [
      'Cancelar presupuesto',
      'Pagar directamente',
      'Pagar con validación',
      'Editar cuenta por cobrar',
      'Eliminar cuenta por cobrar',
    ]) {
      expect(items.some((item) => item.label === label)).toBe(true);
    }
  });

  it('keeps exactly one internal delete action for every deletable list definition', () => {
    for (const definition of LIST_NAVIGATION_DEFINITIONS) {
      const deleteActions = definition.actions.filter(
        (action) => action.requiredAction === 'DELETE',
      );
      if (deleteActions.length === 0) continue;
      expect(deleteActions).toHaveLength(1);
      expect(deleteActions[0].label).toMatch(/^Eliminar/);
    }
  });

  it('uses the singular noun in delete action labels', () => {
    const items = flatten(buildMenuItems(createCallbacks()));
    expect(items.some((item) => item.label === 'Eliminar presupuesto')).toBe(true);
    expect(items.some((item) => item.label === 'Eliminar pedido')).toBe(true);
    expect(items.some((item) => item.label === 'Eliminar compra')).toBe(true);
  });

  it('declares the warehouse movements history as a global destination action', () => {
    const definition = LIST_NAVIGATION_DEFINITIONS.find(
      (entry) => entry.route === '/inventory/warehouses',
    );
    const movements = definition?.destinations?.find(
      (entry) => entry.label === 'Historial de movimientos',
    );

    expect(movements?.routerLink).toBe('/inventory/warehouses/movements');
    expect(movements?.requiredModule).toBe(BusinessModule.INVENTORY_WAREHOUSES);
  });

  it('navigates the movements history directly with INVENTORY_WAREHOUSES:READ', () => {
    const item = flatten(buildMenuItems(createCallbacks())).find(
      (entry) => entry.label === 'Historial de movimientos',
    );

    expect(item?.routerLink).toBe('/inventory/warehouses/movements');
    expect(item?.requiredModule).toBe(BusinessModule.INVENTORY_WAREHOUSES);
    expect(item?.requiredAction).toBe('READ');
    expect(item?.command).toBeUndefined();
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
          expect(callbacks.openCustomerEditPicker).toHaveBeenCalled();
        } else if (definition.route === '/partners/customers' && action.label === 'Ver saldo') {
          expect(callbacks.openCustomerBalancePicker).toHaveBeenCalled();
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

  it('uses catalog reports module for the product catalog report and the commercial catalog', () => {
    const callbacks = createCallbacks();
    const items = flatten(buildMenuItems(callbacks));
    expect(items.find((item) => item.command === callbacks.openCatalogModal)?.requiredModule).toBe(
      BusinessModule.CATALOG_PRODUCTS,
    );
    expect(
      items.find((item) => item.command === callbacks.openCommercialCatalogModal)?.requiredModule,
    ).toBe(BusinessModule.CATALOG_PRODUCTS);
  });
});
