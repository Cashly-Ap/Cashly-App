import { addListNavigationActions } from '@core/layouts/config/list-navigation.config';
import { MenuItem } from '@core/layouts/models';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { CompanyPermission } from '@features/platform/company/permissions';
import { AuditPermission } from '@features/platform/audit/permissions';

export interface MenuCallbacks {
  openListAction: (route: string, action: string, queryParams?: Record<string, string>) => void;
  openCompanyAuditHistory: () => void;
  openCustomerEditPicker: () => void;
  openCustomerBalancePicker: () => void;
  openSupplierBalancePicker: () => void;
  openCatalogModal: () => void;
  openCommercialCatalogModal: () => void;
  openStockModal: () => void;
  openMovementsModal: () => void;
  openOrdersPdfModal: () => void;
  openInvoicesPdfModal: () => void;
  openQuotesPdfModal: () => void;
  openAccountsReceivablePdfModal: () => void;
  openAccountsPayablePdfModal: () => void;
  openCashRegisterModal: () => void;
  openPurchasesPdfModal: () => void;
}

const INVOICE_CONTAINER_ROUTE = '/sales/invoices';
const INVOICE_DOCUMENT_ROUTES = ['/sales/debit-notes', '/sales/credit-notes', '/sales/returns'];

function menuRoute(item: MenuItem): string | undefined {
  return item.routerLink ?? item.children?.find((child) => child.routerLink)?.routerLink;
}

function nestInvoiceDocuments(items: MenuItem[]): MenuItem[] {
  return items.map((item) => {
    if (item.label !== 'Ventas' || !item.children) return item;
    const invoicesIndex = item.children.findIndex(
      (child) => menuRoute(child) === INVOICE_CONTAINER_ROUTE,
    );
    if (invoicesIndex < 0) return item;
    const invoices = item.children[invoicesIndex];
    const documents = INVOICE_DOCUMENT_ROUTES.map((route) =>
      item.children!.find((child) => menuRoute(child) === route),
    ).filter((child): child is MenuItem => child !== undefined);
    const remaining = item.children.filter(
      (child) => menuRoute(child) !== INVOICE_CONTAINER_ROUTE && !documents.includes(child),
    );
    const invoiceChildren = [...(invoices.children ?? [])];
    const trailingIndex = invoiceChildren.findIndex(
      (child) =>
        child.label === 'Historial' ||
        child.label === 'Reportes' ||
        (child.requiredAction === 'EXPORT' && !child.label.startsWith('Descargar PDF')),
    );
    const insertAt = trailingIndex < 0 ? invoiceChildren.length : trailingIndex;
    invoiceChildren.splice(insertAt, 0, ...documents);
    const nested: MenuItem = { ...invoices, children: invoiceChildren };
    remaining.splice(Math.min(invoicesIndex, remaining.length), 0, nested);
    return { ...item, children: remaining };
  });
}

export function buildMenuItems(callbacks: MenuCallbacks): MenuItem[] {
  const businessRoles: NonNullable<MenuItem['allowedRoles']> = ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'];
  const page = (
    label: string,
    icon: string,
    routerLink: string,
    requiredModule: BusinessModule,
  ): MenuItem => ({
    label,
    icon,
    routerLink,
    allowedRoles: businessRoles,
    requiredModule,
  });
  const group = (label: string, icon: string, children: MenuItem[]): MenuItem => ({
    label,
    icon,
    children,
    allowedRoles: businessRoles,
  });
  const report = (
    label: string,
    icon: string,
    command: () => void,
    requiredModule: BusinessModule,
  ): MenuItem => ({
    label,
    icon,
    command,
    requiredAction:
      (
        {
          'Reporte de Presupuestos PDF': 'REPORT_QUOTES',
          'Reporte de Pedidos PDF': 'REPORT_ORDERS',
          'Reporte de Compras PDF': 'REPORT_PURCHASES',
          'Reporte de Productos PDF': 'REPORT_PRODUCTS',
          'Catálogo Comercial PDF': 'REPORT_COMMERCIAL_CATALOG',
          Stock: 'REPORT_STOCK',
          Movimientos: 'REPORT_MOVEMENTS',
          'Reporte de Facturas PDF': 'REPORT_INVOICES',
          'Reportes de Caja': 'REPORT_CASH_REGISTER',
          'Cuentas por Cobrar PDF': 'REPORT_RECEIVABLES',
          'Cuentas por Pagar PDF': 'REPORT_PAYABLES',
        } as Record<
          string,
          import('@features/platform/auth/authorization/models/access.model').PermissionAction
        >
      )[label] ?? 'EXPORT',
    requiredModule,
    allowedRoles: businessRoles,
  });
  const withReports = (item: MenuItem, ...reports: MenuItem[]): MenuItem => ({
    ...item,
    children: reports,
  });

  return nestInvoiceDocuments(
    addListNavigationActions(
      [
        group('Ventas', 'pi pi-shopping-bag', [
          withReports(
            page('Presupuestos', 'pi pi-file-edit', '/sales/quotes', BusinessModule.SALES_QUOTES),
            report(
              'Reporte de Presupuestos PDF',
              'pi pi-file-pdf',
              callbacks.openQuotesPdfModal,
              BusinessModule.SALES_QUOTES,
            ),
          ),
          withReports(
            page('Pedidos', 'pi pi-shopping-cart', '/sales/orders', BusinessModule.SALES_ORDERS),
            report(
              'Reporte de Pedidos PDF',
              'pi pi-file-pdf',
              callbacks.openOrdersPdfModal,
              BusinessModule.SALES_ORDERS,
            ),
          ),
          withReports(
            page(
              'Facturas',
              'pi pi-file',
              '/sales/invoices',
              BusinessModule.SALES_INVOICES_INVOICES,
            ),
            report(
              'Reporte de Facturas PDF',
              'pi pi-file-pdf',
              callbacks.openInvoicesPdfModal,
              BusinessModule.SALES_INVOICES_INVOICES,
            ),
          ),
          page(
            'Notas de débito',
            'pi pi-minus-circle',
            '/sales/debit-notes',
            BusinessModule.SALES_INVOICES_DEBIT_NOTES,
          ),
          page(
            'Notas de crédito',
            'pi pi-file-plus',
            '/sales/credit-notes',
            BusinessModule.SALES_INVOICES_CREDIT_NOTES,
          ),
          page(
            'Devoluciones',
            'pi pi-undo',
            '/sales/returns',
            BusinessModule.SALES_INVOICES_RETURNS,
          ),
        ]),
        group('Compras', 'pi pi-shopping-cart', [
          withReports(
            page(
              'Compras',
              'pi pi-shopping-cart',
              '/procurement/purchases',
              BusinessModule.PURCHASES,
            ),
            report(
              'Reporte de Compras PDF',
              'pi pi-file-pdf',
              callbacks.openPurchasesPdfModal,
              BusinessModule.PURCHASES,
            ),
          ),
        ]),
        group('Catálogo', 'pi pi-list', [
          withReports(
            page('Productos', 'pi pi-box', '/catalog/products', BusinessModule.CATALOG_PRODUCTS),
            report(
              'Reporte de Productos PDF',
              'pi pi-table',
              callbacks.openCatalogModal,
              BusinessModule.CATALOG_PRODUCTS,
            ),
            report(
              'Catálogo Comercial PDF',
              'pi pi-book',
              callbacks.openCommercialCatalogModal,
              BusinessModule.CATALOG_PRODUCTS,
            ),
          ),
          page(
            'Categorías',
            'pi pi-tags',
            '/catalog/categories',
            BusinessModule.CATALOG_CATEGORIES,
          ),
          page(
            'Tipos de precios',
            'pi pi-tag',
            '/catalog/price-types',
            BusinessModule.CATALOG_PRICES,
          ),
        ]),
        group('Inventario', 'pi pi-database', [
          withReports(
            page(
              'Almacenes',
              'pi pi-warehouse',
              '/inventory/warehouses',
              BusinessModule.INVENTORY_WAREHOUSES,
            ),
            group('Reportes', 'pi pi-chart-bar', [
              report(
                'Stock',
                'pi pi-chart-bar',
                callbacks.openStockModal,
                BusinessModule.INVENTORY_WAREHOUSES,
              ),
              report(
                'Movimientos',
                'pi pi-arrow-right-arrow-left',
                callbacks.openMovementsModal,
                BusinessModule.INVENTORY_WAREHOUSES,
              ),
            ]),
          ),
        ]),
        group('Finanzas', 'pi pi-dollar', [
          group('Tesorería', 'pi pi-wallet', [
            withReports(
              page(
                'Caja',
                'pi pi-calculator',
                '/finance/treasury/cash-register',
                BusinessModule.FINANCE_CASH_REGISTER,
              ),
              page(
                'Historial de caja',
                'pi pi-history',
                '/finance/treasury/cash-register/history',
                BusinessModule.FINANCE_CASH_REGISTER,
              ),
              report(
                'Reportes de Caja',
                'pi pi-chart-bar',
                callbacks.openCashRegisterModal,
                BusinessModule.FINANCE_CASH_REGISTER,
              ),
            ),
            withReports(
              page(
                'Cuentas por cobrar',
                'pi pi-money-bill',
                '/finance/treasury/receivables',
                BusinessModule.FINANCE_RECEIVABLES,
              ),
              report(
                'Cuentas por Cobrar PDF',
                'pi pi-file-pdf',
                callbacks.openAccountsReceivablePdfModal,
                BusinessModule.FINANCE_RECEIVABLES,
              ),
            ),
            withReports(
              page(
                'Cuentas por pagar',
                'pi pi-wallet',
                '/finance/treasury/payables',
                BusinessModule.FINANCE_PAYABLES,
              ),
              report(
                'Cuentas por Pagar PDF',
                'pi pi-file-pdf',
                callbacks.openAccountsPayablePdfModal,
                BusinessModule.FINANCE_PAYABLES,
              ),
            ),
            page(
              'Gastos',
              'pi pi-receipt',
              '/finance/treasury/expenses',
              BusinessModule.FINANCE_EXPENSES,
            ),
            page(
              'Métodos de pago',
              'pi pi-credit-card',
              '/finance/treasury/payment-methods',
              BusinessModule.FINANCE_PAYMENT_METHODS,
            ),
          ]),
        ]),
        group('Contactos', 'pi pi-users', [
          page(
            'Clientes',
            'pi pi-id-card',
            '/partners/customers',
            BusinessModule.CONTACTS_CUSTOMERS,
          ),
          page(
            'Proveedores',
            'pi pi-truck',
            '/partners/suppliers',
            BusinessModule.CONTACTS_SUPPLIERS,
          ),
        ]),
        group('Análisis', 'pi pi-chart-line', [
          page('Dashboard', 'pi pi-chart-line', '/analytics/dashboard', BusinessModule.DASHBOARD),
        ]),
        group('Plataforma', 'pi pi-cog', [
          page('Usuarios', 'pi pi-user', '/platform/users', BusinessModule.USERS),
          page('Roles', 'pi pi-shield', '/platform/roles', BusinessModule.ROLES),
          page(
            'Departamentos',
            'pi pi-sitemap',
            '/platform/departments',
            BusinessModule.DEPARTMENTS,
          ),
          group('Compañía', 'pi pi-building', [
            {
              label: 'Ver compañía',
              icon: 'pi pi-eye',
              routerLink: '/platform/company',
              allowedRoles: businessRoles,
              requiredPermission: CompanyPermission.VIEW,
            },
            {
              label: 'Editar compañía',
              icon: 'pi pi-pencil',
              routerLink: '/platform/company/edit',
              allowedRoles: businessRoles,
              requiredPermission: CompanyPermission.EDIT,
            },
            {
              label: 'Historial',
              icon: 'pi pi-history',
              command: callbacks.openCompanyAuditHistory,
              allowedRoles: businessRoles,
              requiredPermission: AuditPermission.VIEW_LIST,
            },
          ]),
        ]),
      ],
      callbacks,
    ),
  );
}
