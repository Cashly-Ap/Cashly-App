import { MenuItem } from '@core/layouts/models';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export interface MenuCallbacks {
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
    requiredModule,
    allowedRoles: businessRoles,
  });

  return [
    group(
      'Ventas',
      'pi pi-briefcase',
      [
        page('Presupuestos', 'pi pi-file-edit', '/sales/quotes'),
        page('Pedidos', 'pi pi-shopping-cart', '/sales/orders'),
        group(
          'Reportes',
          'pi pi-chart-bar',
          [
            report(
              'Reporte de Presupuestos PDF',
              'pi pi-file-pdf',
              callbacks.openQuotesPdfModal,
              BusinessModule.SALES,
            ),
            report(
              'Reporte de Pedidos PDF',
              'pi pi-file-pdf',
              callbacks.openOrdersPdfModal,
              BusinessModule.SALES,
            ),
          ],
          BusinessModule.DOCUMENT_ADMIN,
        ),
      ],
      BusinessModule.SALES,
    ),
    group(
      'Compras',
      'pi pi-shopping-cart',
      [
        page('Compras', 'pi pi-shopping-cart', '/procurement/purchases'),
        group(
          'Reportes',
          'pi pi-chart-bar',
          [
            report(
              'Reporte de Compras PDF',
              'pi pi-file-pdf',
              callbacks.openPurchasesPdfModal,
              BusinessModule.PURCHASES,
            ),
          ],
          BusinessModule.DOCUMENT_ADMIN,
        ),
      ],
      BusinessModule.PURCHASES,
    ),
    group(
      'Catálogo',
      'pi pi-book',
      [
        page('Productos', 'pi pi-box', '/catalog/products'),
        page('Categorías', 'pi pi-tags', '/catalog/categories'),
        page('Tipos de precios', 'pi pi-tag', '/catalog/price-types'),
        group(
          'Reportes',
          'pi pi-chart-bar',
          [
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
          ],
          BusinessModule.DOCUMENT_ADMIN,
        ),
      ],
      BusinessModule.CATALOG,
    ),
    group(
      'Inventario',
      'pi pi-box',
      [
        page('Almacenes', 'pi pi-database', '/inventory/warehouses'),
        group(
          'Reportes',
          'pi pi-chart-bar',
          [
            report(
              'Stock PDF',
              'pi pi-warehouse',
              callbacks.openStockModal,
              BusinessModule.INVENTORY,
            ),
            report(
              'Movimientos PDF',
              'pi pi-arrow-right-arrow-left',
              callbacks.openMovementsModal,
              BusinessModule.INVENTORY,
            ),
          ],
          BusinessModule.DOCUMENT_ADMIN,
        ),
      ],
      BusinessModule.INVENTORY,
    ),
    group('Finanzas', 'pi pi-dollar', [
      group('Facturación', 'pi pi-file', [
        page('Facturas', 'pi pi-file', '/finance/billing/invoices', BusinessModule.FINANCE),
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
        group(
          'Reportes',
          'pi pi-chart-bar',
          [
            {
              ...report(
                'Reporte de Facturas PDF',
                'pi pi-file-pdf',
                callbacks.openInvoicesPdfModal,
                BusinessModule.FINANCE,
              ),
              requiredModule: BusinessModule.FINANCE,
            },
          ],
          BusinessModule.DOCUMENT_ADMIN,
        ),
      ]),
      group(
        'Tesorería',
        'pi pi-wallet',
        [
          page('Caja', 'pi pi-calculator', '/finance/treasury/cash-register'),
          page('Historial de caja', 'pi pi-history', '/finance/treasury/cash-register/history'),
          page('Cuentas por cobrar', 'pi pi-money-bill', '/finance/treasury/receivables'),
          page('Métodos de pago', 'pi pi-credit-card', '/finance/treasury/payment-methods'),
          group(
            'Reportes',
            'pi pi-chart-bar',
            [
              report(
                'Reportes de Caja',
                'pi pi-chart-bar',
                callbacks.openCashRegisterModal,
                BusinessModule.FINANCE,
              ),
              report(
                'Cuentas por Cobrar PDF',
                'pi pi-file-pdf',
                callbacks.openAccountsReceivablePdfModal,
                BusinessModule.FINANCE,
              ),
            ],
            BusinessModule.DOCUMENT_ADMIN,
          ),
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
      group(
        'Reportes',
        'pi pi-chart-bar',
        [
          page(
            'Inventario consolidado',
            'pi pi-box',
            '/analytics/reports/inventory',
            BusinessModule.INVENTORY,
          ),
        ],
        BusinessModule.DOCUMENT_ADMIN,
      ),
    ]),
    group('Plataforma', 'pi pi-cog', [
      {
        ...page('Usuarios', 'pi pi-user', '/platform/users', BusinessModule.USERS),
      },
      page('Roles', 'pi pi-shield', '/platform/roles', BusinessModule.ROLES),
      page('Departamentos', 'pi pi-sitemap', '/platform/departments', BusinessModule.DEPARTMENTS),
    ]),
  ];
}
