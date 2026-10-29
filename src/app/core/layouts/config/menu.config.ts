import { addListNavigationActions } from './list-navigation.config';
import { MenuItem } from '@core/layouts/models';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

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
    requiredModule?: BusinessModule,
  ): MenuItem => ({
    label,
    icon,
    routerLink,
    allowedRoles: businessRoles,
    ...(requiredModule ? { requiredModule } : {}),
  });
  const group = (
    label: string,
    icon: string,
    children: MenuItem[],
    requiredModule?: BusinessModule,
  ): MenuItem => ({
    label,
    icon,
    children,
    allowedRoles: businessRoles,
    ...(requiredModule ? { requiredModule } : {}),
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
    requiredAction: 'EXPORT',
    requiredPermissions: ['DOCUMENT_ADMIN:READ'],
    requiredModule,
    allowedRoles: businessRoles,
  });

  const withReports = (item: MenuItem, ...reports: MenuItem[]): MenuItem => ({
    ...item,
    children: reports,
  });

  return addListNavigationActions(
    [
      group(
        'Ventas',
        'pi pi-briefcase',
        [
          withReports(
            page('Presupuestos', 'pi pi-file-edit', '/sales/quotes'),
            report(
              'Reporte de Presupuestos PDF',
              'pi pi-file-pdf',
              callbacks.openQuotesPdfModal,
              BusinessModule.SALES,
            ),
          ),
          withReports(
            page('Pedidos', 'pi pi-shopping-cart', '/sales/orders'),
            report(
              'Reporte de Pedidos PDF',
              'pi pi-file-pdf',
              callbacks.openOrdersPdfModal,
              BusinessModule.SALES,
            ),
          ),
        ],
        BusinessModule.SALES,
      ),
      group(
        'Compras',
        'pi pi-shopping-cart',
        [
          withReports(
            page('Compras', 'pi pi-shopping-cart', '/procurement/purchases'),
            report(
              'Reporte de Compras PDF',
              'pi pi-file-pdf',
              callbacks.openPurchasesPdfModal,
              BusinessModule.PURCHASES,
            ),
          ),
        ],
        BusinessModule.PURCHASES,
      ),
      group(
        'Catálogo',
        'pi pi-book',
        [
          withReports(
            page('Productos', 'pi pi-box', '/catalog/products'),
            report(
              'Reporte de Productos PDF',
              'pi pi-table',
              callbacks.openCatalogModal,
              BusinessModule.INVENTORY,
            ),
            report(
              'Catálogo Comercial PDF',
              'pi pi-book',
              callbacks.openCommercialCatalogModal,
              BusinessModule.CATALOG,
            ),
          ),
          page('Categorías', 'pi pi-tags', '/catalog/categories'),
          page('Tipos de precios', 'pi pi-tag', '/catalog/price-types'),
        ],
        BusinessModule.CATALOG,
      ),
      group(
        'Inventario',
        'pi pi-box',
        [
          withReports(
            page('Almacenes', 'pi pi-database', '/inventory/warehouses'),
            group(
              'Reportes',
              'pi pi-chart-bar',
              [
                report(
                  'Stock',
                  'pi pi-warehouse',
                  callbacks.openStockModal,
                  BusinessModule.INVENTORY,
                ),
                report(
                  'Movimientos',
                  'pi pi-arrow-right-arrow-left',
                  callbacks.openMovementsModal,
                  BusinessModule.INVENTORY,
                ),
              ],
              BusinessModule.INVENTORY,
            ),
          ),
        ],
        BusinessModule.INVENTORY,
      ),
      group('Finanzas', 'pi pi-dollar', [
        group('Facturación', 'pi pi-file', [
          withReports(
            page('Facturas', 'pi pi-file', '/finance/billing/invoices', BusinessModule.FINANCE),
            report(
              'Reporte de Facturas PDF',
              'pi pi-file-pdf',
              callbacks.openInvoicesPdfModal,
              BusinessModule.FINANCE,
            ),
          ),
          page('Devoluciones', 'pi pi-undo', '/finance/billing/returns', BusinessModule.FINANCE),
          page(
            'Notas de crédito',
            'pi pi-file-plus',
            '/finance/billing/credit-notes',
            BusinessModule.FINANCE,
          ),
          page(
            'Notas de débito',
            'pi pi-minus-circle',
            '/finance/billing/debit-notes',
            BusinessModule.FINANCE,
          ),
        ]),
        group(
          'Tesorería',
          'pi pi-wallet',
          [
            withReports(
              page('Caja', 'pi pi-calculator', '/finance/treasury/cash-register'),
              page('Historial de caja', 'pi pi-history', '/finance/treasury/cash-register/history'),
              report(
                'Reportes de Caja',
                'pi pi-chart-bar',
                callbacks.openCashRegisterModal,
                BusinessModule.FINANCE,
              ),
            ),
            withReports(
              page('Cuentas por cobrar', 'pi pi-money-bill', '/finance/treasury/receivables'),
              report(
                'Cuentas por Cobrar PDF',
                'pi pi-file-pdf',
                callbacks.openAccountsReceivablePdfModal,
                BusinessModule.FINANCE,
              ),
            ),
            page('Métodos de pago', 'pi pi-credit-card', '/finance/treasury/payment-methods'),
          ],
          BusinessModule.FINANCE,
        ),
      ]),
      group('Contactos', 'pi pi-address-book', [
        page('Clientes', 'pi pi-id-card', '/partners/customers', BusinessModule.SALES),
        page('Proveedores', 'pi pi-truck', '/partners/suppliers', BusinessModule.PURCHASES),
      ]),
      group('Análisis', 'pi pi-chart-line', [
        page('Dashboard', 'pi pi-chart-line', '/analytics/dashboard', BusinessModule.DASHBOARD),
      ]),
      group('Plataforma', 'pi pi-cog', [
        {
          ...page('Usuarios', 'pi pi-user', '/platform/users', BusinessModule.USERS),
        },
        page('Roles', 'pi pi-shield', '/platform/roles', BusinessModule.ROLES),
        page('Departamentos', 'pi pi-sitemap', '/platform/departments', BusinessModule.DEPARTMENTS),
      ]),
    ],
    callbacks,
  );
}
