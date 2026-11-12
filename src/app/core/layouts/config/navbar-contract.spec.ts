import { describe, expect, it, vi } from 'vitest';
import { MenuItem } from '@core/layouts/models';
import { buildMenuItems, MenuCallbacks } from '@core/layouts/config/menu.config';
import { MENU_AREA_ORDER } from '@core/layouts/config/menu-order.config';
import { moduleForUrl } from '@features/platform/auth/authorization/models/permission-context';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

const CONTRACT_AREAS = [
  'Ventas',
  'Compras',
  'Catálogo',
  'Inventario',
  'Finanzas',
  'Contactos',
  'Análisis',
  'Plataforma',
];

const REPORT_ACTIONS: ReadonlyArray<readonly [label: string, action: string]> = [
  ['Reporte de Presupuestos PDF', 'REPORT_QUOTES'],
  ['Reporte de Pedidos PDF', 'REPORT_ORDERS'],
  ['Reporte de Compras PDF', 'REPORT_PURCHASES'],
  ['Reporte de Productos PDF', 'REPORT_PRODUCTS'],
  ['Catálogo Comercial PDF', 'REPORT_COMMERCIAL_CATALOG'],
  ['Stock', 'REPORT_STOCK'],
  ['Movimientos', 'REPORT_MOVEMENTS'],
  ['Reporte de Facturas PDF', 'REPORT_INVOICES'],
  ['Reportes de Caja', 'REPORT_CASH_REGISTER'],
  ['Cuentas por Cobrar PDF', 'REPORT_RECEIVABLES'],
  ['Cuentas por Pagar PDF', 'REPORT_PAYABLES'],
];

function callbacks(): MenuCallbacks {
  return {
    openListAction: vi.fn(),
    openCustomerEditPicker: vi.fn(),
    openCustomerBalancePicker: vi.fn(),
    openSupplierBalancePicker: vi.fn(),
    openCatalogModal: vi.fn(),
    openCommercialCatalogModal: vi.fn(),
    openStockModal: vi.fn(),
    openMovementsModal: vi.fn(),
    openOrdersPdfModal: vi.fn(),
    openInvoicesPdfModal: vi.fn(),
    openQuotesPdfModal: vi.fn(),
    openAccountsReceivablePdfModal: vi.fn(),
    openAccountsPayablePdfModal: vi.fn(),
    openCashRegisterModal: vi.fn(),
    openPurchasesPdfModal: vi.fn(),
    openCompanyAuditHistory: vi.fn(),
  };
}

function flatten(items: MenuItem[]): MenuItem[] {
  return items.flatMap((item) => [item, ...flatten(item.children ?? [])]);
}

describe('navbar contract', () => {
  const menu = buildMenuItems(callbacks());
  const all = flatten(menu);

  it('keeps top-level areas in navbar order', () => {
    expect(menu.map((item) => item.label)).toEqual(CONTRACT_AREAS);
    expect(MENU_AREA_ORDER.map((area) => area.area)).toEqual(CONTRACT_AREAS);
  });

  it('covers every business module exactly once in the editor order', () => {
    const modules = MENU_AREA_ORDER.flatMap((area) => area.modules);
    expect(new Set(modules).size).toBe(modules.length);
    expect([...modules].sort()).toEqual(Object.values(BusinessModule).sort());
  });

  it('assigns a module to every navigable menu leaf', () => {
    const leaves = all.filter((item) => !item.children);
    for (const leaf of leaves) {
      if (leaf.requiredPermission) continue;
      expect(leaf.requiredModule, leaf.label).toBeDefined();
    }
  });

  it.each(REPORT_ACTIONS)('maps %s to %s', (label, action) => {
    const matches = all.filter((item) => item.label === label);
    expect(matches.length).toBeGreaterThan(0);
    for (const item of matches) expect(item.requiredAction).toBe(action);
  });

  it('never gates reports on DOCUMENT_ADMIN', () => {
    for (const item of all) {
      expect(item.requiredPermissions ?? []).not.toContain('DOCUMENT_ADMIN:READ');
    }
  });

  it('resolves list routes to their business module', () => {
    const routes: ReadonlyArray<readonly [string, BusinessModule]> = [
      ['/sales/quotes', BusinessModule.SALES_QUOTES],
      ['/sales/orders', BusinessModule.SALES_ORDERS],
      ['/procurement/purchases', BusinessModule.PURCHASES],
      ['/catalog/products', BusinessModule.CATALOG_PRODUCTS],
      ['/catalog/categories', BusinessModule.CATALOG_CATEGORIES],
      ['/catalog/price-types', BusinessModule.CATALOG_PRICES],
      ['/inventory/warehouses', BusinessModule.INVENTORY_WAREHOUSES],
      ['/finance/billing/invoices', BusinessModule.FINANCE_INVOICES],
      ['/finance/billing/returns', BusinessModule.FINANCE_RETURNS],
      ['/finance/billing/credit-notes', BusinessModule.FINANCE_CREDIT_NOTES],
      ['/finance/billing/debit-notes', BusinessModule.FINANCE_DEBIT_NOTES],
      ['/finance/treasury/cash-register', BusinessModule.FINANCE_CASH_REGISTER],
      ['/finance/treasury/receivables', BusinessModule.FINANCE_RECEIVABLES],
      ['/finance/treasury/payables', BusinessModule.FINANCE_PAYABLES],
      ['/finance/treasury/payment-methods', BusinessModule.FINANCE_PAYMENT_METHODS],
      ['/partners/customers', BusinessModule.CONTACTS_CUSTOMERS],
      ['/partners/suppliers', BusinessModule.CONTACTS_SUPPLIERS],
      ['/platform/users', BusinessModule.USERS],
      ['/platform/roles', BusinessModule.ROLES],
      ['/platform/departments', BusinessModule.DEPARTMENTS],
      ['/analytics/dashboard', BusinessModule.DASHBOARD],
    ];
    for (const [route, module] of routes) {
      expect(moduleForUrl(route)).toBe(module);
    }
  });
});
