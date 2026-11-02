import { describe, expect, it, vi } from 'vitest';
import { MenuItem } from '@core/layouts/models';
import { buildMenuItems, MenuCallbacks } from '@core/layouts/config/menu.config';
import { MENU_AREA_ORDER } from '@core/layouts/config/menu-order.config';
import { moduleForUrl } from '@features/platform/auth/authorization/models/permission-context';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

const CONTRACT_LEAVES: ReadonlyArray<readonly [label: string, permission: string]> = [
  ['Ver presupuestos', 'SALES_QUOTES:READ'],
  ['Ver detalle de presupuesto', 'SALES_QUOTES:READ'],
  ['Editar presupuesto', 'SALES_QUOTES:UPDATE'],
  ['Crear presupuesto', 'SALES_QUOTES:CREATE'],
  ['Descargar PDF de presupuesto', 'SALES_QUOTES:EXPORT'],
  ['Convertir a pedido', 'SALES_ORDERS:CREATE'],
  ['Convertir a factura', 'FINANCE_INVOICES:CREATE'],
  ['Reporte de Presupuestos PDF', 'SALES_QUOTES:EXPORT'],
  ['Ver pedidos', 'SALES_ORDERS:READ'],
  ['Ver detalle de pedido', 'SALES_ORDERS:READ'],
  ['Editar pedido', 'SALES_ORDERS:UPDATE'],
  ['Crear pedido', 'SALES_ORDERS:CREATE'],
  ['Descargar PDF de pedido', 'SALES_ORDERS:EXPORT'],
  ['Confirmar pedido', 'SALES_ORDERS:CONFIRM'],
  ['Cancelar pedido', 'SALES_ORDERS:CANCEL'],
  ['Reporte de Pedidos PDF', 'SALES_ORDERS:EXPORT'],
  ['Ver compras', 'PURCHASES:READ'],
  ['Ver detalle de compra', 'PURCHASES:READ'],
  ['Editar compra', 'PURCHASES:UPDATE'],
  ['Crear compra', 'PURCHASES:CREATE'],
  ['Descargar PDF de compra', 'PURCHASES:EXPORT'],
  ['Confirmar compra', 'PURCHASES:CONFIRM'],
  ['Cancelar compra', 'PURCHASES:CANCEL'],
  ['Reporte de Compras PDF', 'PURCHASES:EXPORT'],
  ['Ver productos', 'CATALOG_PRODUCTS:READ'],
  ['Ver detalle de producto', 'CATALOG_PRODUCTS:READ'],
  ['Editar producto', 'CATALOG_PRODUCTS:UPDATE'],
  ['Crear producto', 'CATALOG_PRODUCTS:CREATE'],
  ['Reporte de Productos PDF', 'CATALOG_PRODUCTS:EXPORT'],
  ['Catálogo Comercial PDF', 'CATALOG_PRODUCTS:EXPORT'],
  ['Ver categorías', 'CATALOG_CATEGORIES:READ'],
  ['Ver detalle de categoría', 'CATALOG_CATEGORIES:READ'],
  ['Editar categoría', 'CATALOG_CATEGORIES:UPDATE'],
  ['Crear categoría', 'CATALOG_CATEGORIES:CREATE'],
  ['Ver tipos de precios', 'CATALOG_PRICES:READ'],
  ['Ver detalle de tipo de precio', 'CATALOG_PRICES:READ'],
  ['Editar tipo de precio', 'CATALOG_PRICES:UPDATE'],
  ['Crear tipo de precio', 'CATALOG_PRICES:CREATE'],
  ['Ver almacenes', 'INVENTORY_WAREHOUSES:READ'],
  ['Ver detalle de almacén', 'INVENTORY_WAREHOUSES:READ'],
  ['Editar almacén', 'INVENTORY_WAREHOUSES:UPDATE'],
  ['Crear almacén', 'INVENTORY_WAREHOUSES:CREATE'],
  ['Ver stock', 'INVENTORY_WAREHOUSES:READ'],
  ['Registrar entrada', 'INVENTORY_WAREHOUSES:EXECUTE'],
  ['Registrar salida', 'INVENTORY_WAREHOUSES:EXECUTE'],
  ['Historial de movimientos', 'INVENTORY_WAREHOUSES:READ'],
  ['Stock', 'INVENTORY_WAREHOUSES:EXPORT'],
  ['Movimientos', 'INVENTORY_WAREHOUSES:EXPORT'],
  ['Ver facturas', 'FINANCE_INVOICES:READ'],
  ['Ver detalle de factura', 'FINANCE_INVOICES:READ'],
  ['Editar factura', 'FINANCE_INVOICES:UPDATE'],
  ['Crear factura', 'FINANCE_INVOICES:CREATE'],
  ['Descargar PDF de factura', 'FINANCE_INVOICES:EXPORT'],
  ['Confirmar factura', 'FINANCE_INVOICES:CONFIRM'],
  ['Cancelar factura', 'FINANCE_INVOICES:CANCEL'],
  ['Duplicar factura', 'FINANCE_INVOICES:CREATE'],
  ['Reporte de Facturas PDF', 'FINANCE_INVOICES:EXPORT'],
  ['Ver devoluciones', 'FINANCE_RETURNS:READ'],
  ['Ver detalle de devolución', 'FINANCE_RETURNS:READ'],
  ['Crear devolución', 'FINANCE_RETURNS:CREATE'],
  ['Ver notas de crédito', 'FINANCE_CREDIT_NOTES:READ'],
  ['Ver detalle de nota de crédito', 'FINANCE_CREDIT_NOTES:READ'],
  ['Crear nota de crédito', 'FINANCE_CREDIT_NOTES:CREATE'],
  ['Ver notas de débito', 'FINANCE_DEBIT_NOTES:READ'],
  ['Ver detalle de nota de débito', 'FINANCE_DEBIT_NOTES:READ'],
  ['Crear nota de débito', 'FINANCE_DEBIT_NOTES:CREATE'],
  ['Ver caja', 'FINANCE_CASH_REGISTER:READ'],
  ['Ver detalles', 'FINANCE_CASH_REGISTER:READ'],
  ['Historial de caja', 'FINANCE_CASH_REGISTER:READ'],
  ['Abrir caja', 'FINANCE_CASH_REGISTER:EXECUTE'],
  ['Cerrar caja', 'FINANCE_CASH_REGISTER:EXECUTE'],
  ['Reportes de Caja', 'FINANCE_CASH_REGISTER:EXPORT'],
  ['Ver cuentas por cobrar', 'FINANCE_RECEIVABLES:READ'],
  ['Ver deuda', 'FINANCE_RECEIVABLES:READ'],
  ['Pagar todo', 'FINANCE_RECEIVABLES:EXECUTE'],
  ['Pago parcial', 'FINANCE_RECEIVABLES:EXECUTE'],
  ['Reintegro', 'FINANCE_RECEIVABLES:EXECUTE'],
  ['Generar anticipo', 'FINANCE_RECEIVABLES:EXECUTE'],
  ['Aprobar pago', 'FINANCE_RECEIVABLES:EXECUTE'],
  ['Rechazar pago', 'FINANCE_RECEIVABLES:EXECUTE'],
  ['Cuentas por Cobrar PDF', 'FINANCE_RECEIVABLES:EXPORT'],
  ['Ver métodos de pago', 'FINANCE_PAYMENT_METHODS:READ'],
  ['Ver detalle de método de pago', 'FINANCE_PAYMENT_METHODS:READ'],
  ['Editar método de pago', 'FINANCE_PAYMENT_METHODS:UPDATE'],
  ['Crear método de pago', 'FINANCE_PAYMENT_METHODS:CREATE'],
  ['Ver clientes', 'CONTACTS_CUSTOMERS:READ'],
  ['Ver detalle de cliente', 'CONTACTS_CUSTOMERS:READ'],
  ['Editar cliente', 'CONTACTS_CUSTOMERS:UPDATE'],
  ['Crear cliente', 'CONTACTS_CUSTOMERS:CREATE'],
  ['Ver saldo de cliente', 'CONTACTS_CUSTOMERS:READ'],
  ['Ver proveedores', 'CONTACTS_SUPPLIERS:READ'],
  ['Ver detalle de proveedor', 'CONTACTS_SUPPLIERS:READ'],
  ['Editar proveedor', 'CONTACTS_SUPPLIERS:UPDATE'],
  ['Crear proveedor', 'CONTACTS_SUPPLIERS:CREATE'],
  ['Dashboard', 'DASHBOARD:READ'],
  ['Ver usuarios', 'USERS:READ'],
  ['Ver detalle de usuario', 'USERS:READ'],
  ['Editar usuario', 'USERS:UPDATE'],
  ['Crear usuario', 'USERS:CREATE'],
  ['Ver roles', 'ROLES:READ'],
  ['Ver detalle de rol', 'ROLES:READ'],
  ['Editar rol', 'ROLES:UPDATE'],
  ['Crear rol', 'ROLES:CREATE'],
  ['Ver departamentos', 'DEPARTMENTS:READ'],
  ['Ver detalle de departamento', 'DEPARTMENTS:READ'],
  ['Editar departamento', 'DEPARTMENTS:UPDATE'],
  ['Crear departamento', 'DEPARTMENTS:CREATE'],
];

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

const CONTRACT_ROUTES: ReadonlyArray<readonly [route: string, module: BusinessModule]> = [
  ['/sales/quotes', BusinessModule.SALES_QUOTES],
  ['/sales/orders', BusinessModule.SALES_ORDERS],
  ['/procurement/purchases', BusinessModule.PURCHASES],
  ['/catalog/products', BusinessModule.CATALOG_PRODUCTS],
  ['/catalog/categories', BusinessModule.CATALOG_CATEGORIES],
  ['/catalog/price-types', BusinessModule.CATALOG_PRICES],
  ['/inventory/warehouses', BusinessModule.INVENTORY_WAREHOUSES],
  ['/inventory/warehouses/stock', BusinessModule.INVENTORY_WAREHOUSES],
  ['/inventory/warehouses/movements', BusinessModule.INVENTORY_WAREHOUSES],
  ['/finance/billing/invoices', BusinessModule.FINANCE_INVOICES],
  ['/finance/billing/returns', BusinessModule.FINANCE_RETURNS],
  ['/finance/billing/credit-notes', BusinessModule.FINANCE_CREDIT_NOTES],
  ['/finance/billing/debit-notes', BusinessModule.FINANCE_DEBIT_NOTES],
  ['/finance/treasury/cash-register', BusinessModule.FINANCE_CASH_REGISTER],
  ['/finance/treasury/cash-register/history', BusinessModule.FINANCE_CASH_REGISTER],
  ['/finance/treasury/receivables', BusinessModule.FINANCE_RECEIVABLES],
  ['/finance/treasury/payment-methods', BusinessModule.FINANCE_PAYMENT_METHODS],
  ['/partners/customers', BusinessModule.CONTACTS_CUSTOMERS],
  ['/partners/suppliers', BusinessModule.CONTACTS_SUPPLIERS],
  ['/analytics/dashboard', BusinessModule.DASHBOARD],
  ['/platform/users', BusinessModule.USERS],
  ['/platform/roles', BusinessModule.ROLES],
  ['/platform/departments', BusinessModule.DEPARTMENTS],
];

function callbacks(): MenuCallbacks {
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

describe('navbar contract with navbar-permission-tree.json', () => {
  const menu = buildMenuItems(callbacks());
  const all = flatten(menu);

  it.each(CONTRACT_LEAVES)('backs "%s" with %s', (label, permission) => {
    const [module, action] = permission.split(':');
    const matches = all.filter((item) => item.label === label);
    expect(matches.length).toBeGreaterThan(0);
    for (const item of matches) {
      expect(item.requiredModule).toBe(module);
      expect(item.requiredAction ?? 'READ').toBe(action);
    }
  });

  it.each(CONTRACT_ROUTES)('routes %s to its own module', (route, module) => {
    const matches = all.filter((item) => item.routerLink === route);
    expect(matches.length).toBeGreaterThan(0);
    for (const item of matches) expect(item.requiredModule).toBe(module);
    expect(moduleForUrl(route)).toBe(module);
  });

  it('resolves customer balance URLs to CONTACTS_CUSTOMERS', () => {
    expect(moduleForUrl('/partners/customers/c-1/balance')).toBe(
      BusinessModule.CONTACTS_CUSTOMERS,
    );
    expect(moduleForUrl('/partners/customers/c-1')).toBe(BusinessModule.CONTACTS_CUSTOMERS);
  });

  it('covers exactly the 27 contract modules and nothing else', () => {
    const used = new Set(all.flatMap((item) => (item.requiredModule ? [item.requiredModule] : [])));
    expect([...used].sort()).toEqual(Object.values(BusinessModule).sort());
    expect(used.size).toBe(27);
  });

  it('keeps top-level areas in navbar contract order', () => {
    expect(menu.map((item) => item.label)).toEqual(CONTRACT_AREAS);
    expect(MENU_AREA_ORDER.map((area) => area.area)).toEqual(CONTRACT_AREAS);
  });

  it('derives the editor module order from the navbar tree without duplicates', () => {
    const ordered = MENU_AREA_ORDER.flatMap((area) => area.modules);
    expect(new Set(ordered).size).toBe(ordered.length);
    expect([...ordered].sort()).toEqual(Object.values(BusinessModule).sort());
    expect(MENU_AREA_ORDER.find((area) => area.area === 'Contactos')?.modules).toEqual([
      BusinessModule.CONTACTS_CUSTOMERS,
      BusinessModule.CONTACTS_CUSTOMERS,
      BusinessModule.CONTACTS_SUPPLIERS,
    ]);
  });

  it('never gates reports on DOCUMENT_ADMIN', () => {
    const reports = all.filter((item) => item.requiredAction === 'EXPORT');
    expect(reports.length).toBeGreaterThan(0);
    for (const item of reports) {
      expect(item.requiredModule).toBeDefined();
      expect(item.requiredPermissions ?? []).toEqual([]);
    }
  });
});
