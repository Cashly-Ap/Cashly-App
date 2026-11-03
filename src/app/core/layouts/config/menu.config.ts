import { addListNavigationActions } from '@core/layouts/config/list-navigation.config';
import { MenuItem } from '@core/layouts/models';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { CompanyPermission } from '@features/platform/company/permissions';

export interface MenuCallbacks {
  openListAction: (route: string, action: string, queryParams?: Record<string, string>) => void;
  openCustomerEditPicker: () => void;
  openCustomerBalancePicker: () => void;
  openCatalogModal: () => void;
  openCommercialCatalogModal: () => void;
  openStockModal: () => void;
  openMovementsModal: () => void;
  openOrdersPdfModal: () => void;
  openInvoicesPdfModal: () => void;
  openQuotesPdfModal: () => void;
  openAccountsReceivablePdfModal: () => void;
  openCashRegisterModal: () => void;
  openPurchasesPdfModal: () => void;
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
    requiredAction: ({
      'Reporte de Presupuestos PDF': 'REPORT_QUOTES', 'Reporte de Pedidos PDF': 'REPORT_ORDERS',
      'Reporte de Compras PDF': 'REPORT_PURCHASES', 'Reporte de Productos PDF': 'REPORT_PRODUCTS',
      'Catálogo Comercial PDF': 'REPORT_COMMERCIAL_CATALOG', Stock: 'REPORT_STOCK', Movimientos: 'REPORT_MOVEMENTS',
      'Reporte de Facturas PDF': 'REPORT_INVOICES', 'Reportes de Caja': 'REPORT_CASH_REGISTER',
      'Cuentas por Cobrar PDF': 'REPORT_RECEIVABLES',
    } as Record<string, import('@features/platform/auth/authorization/models/access.model').PermissionAction>)[label] ?? 'EXPORT',
    requiredModule,
    allowedRoles: businessRoles,
  });
  const withReports = (item: MenuItem, ...reports: MenuItem[]): MenuItem => ({
    ...item,
    children: reports,
  });

  return addListNavigationActions(
    [
      group('Ventas', 'pi pi-briefcase', [
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
      ]),
      group('Compras', 'pi pi-shopping-cart', [
        withReports(
          page('Compras', 'pi pi-shopping-cart', '/procurement/purchases', BusinessModule.PURCHASES),
          report(
            'Reporte de Compras PDF',
            'pi pi-file-pdf',
            callbacks.openPurchasesPdfModal,
            BusinessModule.PURCHASES,
          ),
        ),
      ]),
      group('Catálogo', 'pi pi-book', [
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
        page('Categorías', 'pi pi-tags', '/catalog/categories', BusinessModule.CATALOG_CATEGORIES),
        page('Tipos de precios', 'pi pi-tag', '/catalog/price-types', BusinessModule.CATALOG_PRICES),
      ]),
      group('Inventario', 'pi pi-box', [
        withReports(
          page(
            'Almacenes',
            'pi pi-database',
            '/inventory/warehouses',
            BusinessModule.INVENTORY_WAREHOUSES,
          ),
          group('Reportes', 'pi pi-chart-bar', [
            report('Stock', 'pi pi-warehouse', callbacks.openStockModal, BusinessModule.INVENTORY_WAREHOUSES),
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
        group('Facturación', 'pi pi-file', [
          withReports(
            page('Facturas', 'pi pi-file', '/finance/billing/invoices', BusinessModule.FINANCE_INVOICES),
            report(
              'Reporte de Facturas PDF',
              'pi pi-file-pdf',
              callbacks.openInvoicesPdfModal,
              BusinessModule.FINANCE_INVOICES,
            ),
          ),
          page('Devoluciones', 'pi pi-undo', '/finance/billing/returns', BusinessModule.FINANCE_RETURNS),
          page(
            'Notas de crédito',
            'pi pi-file-plus',
            '/finance/billing/credit-notes',
            BusinessModule.FINANCE_CREDIT_NOTES,
          ),
          page(
            'Notas de débito',
            'pi pi-minus-circle',
            '/finance/billing/debit-notes',
            BusinessModule.FINANCE_DEBIT_NOTES,
          ),
        ]),
        group('Tesorería', 'pi pi-wallet', [
          withReports(
            page('Caja', 'pi pi-calculator', '/finance/treasury/cash-register', BusinessModule.FINANCE_CASH_REGISTER),
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
          page(
            'Métodos de pago',
            'pi pi-credit-card',
            '/finance/treasury/payment-methods',
            BusinessModule.FINANCE_PAYMENT_METHODS,
          ),
        ]),
      ]),
      group('Contactos', 'pi pi-address-book', [
        page('Clientes', 'pi pi-id-card', '/partners/customers', BusinessModule.CONTACTS_CUSTOMERS),
        page('Proveedores', 'pi pi-truck', '/partners/suppliers', BusinessModule.CONTACTS_SUPPLIERS),
      ]),
      group('Análisis', 'pi pi-chart-line', [
        page('Dashboard', 'pi pi-chart-line', '/analytics/dashboard', BusinessModule.DASHBOARD),
      ]),
      group('Plataforma', 'pi pi-cog', [
        page('Usuarios', 'pi pi-user', '/platform/users', BusinessModule.USERS),
        page('Roles', 'pi pi-shield', '/platform/roles', BusinessModule.ROLES),
        page('Departamentos', 'pi pi-sitemap', '/platform/departments', BusinessModule.DEPARTMENTS),
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
        ]),
      ]),
    ],
    callbacks,
  );
}
