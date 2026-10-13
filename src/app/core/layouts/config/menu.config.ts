import { MenuItem } from '@core/layouts/models';
import { BusinessModule } from '@features/users/models/enums';

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
  const report = (label: string, icon: string, command: () => void): MenuItem => ({
    label,
    icon,
    command,
    allowedRoles: businessRoles,
  });

  return [
    page('Dashboard', 'pi pi-chart-line', '/dashboard', BusinessModule.DASHBOARD),
    group('Ventas', 'pi pi-briefcase', [
      page('Clientes', 'pi pi-id-card', '/customers', BusinessModule.SALES),
      group(
        'Documentos de venta',
        'pi pi-file',
        [
          page('Presupuestos', 'pi pi-file-edit', '/quotes'),
          page('Pedidos', 'pi pi-shopping-cart', '/orders'),
          page('Facturas', 'pi pi-file', '/invoices'),
        ],
        BusinessModule.SALES,
      ),
      page('Tipos de precios', 'pi pi-tag', '/price-types', BusinessModule.INVENTORY),
    ]),
    group(
      'Compras',
      'pi pi-shopping-cart',
      [
        page('Proveedores', 'pi pi-truck', '/suppliers'),
        group('Abastecimiento', 'pi pi-shopping-cart', [
          page('Compras', 'pi pi-shopping-cart', '/purchases'),
        ]),
      ],
      BusinessModule.PURCHASES,
    ),
    group(
      'Inventario',
      'pi pi-box',
      [
        group('Catálogo', 'pi pi-book', [
          page('Productos', 'pi pi-box', '/products'),
          page('Categorías', 'pi pi-tags', '/categories'),
        ]),
        group('Logística', 'pi pi-truck', [page('Almacenes', 'pi pi-database', '/warehouses')]),
      ],
      BusinessModule.INVENTORY,
    ),
    group(
      'Finanzas',
      'pi pi-dollar',
      [
        group('Tesorería', 'pi pi-wallet', [
          page('Caja', 'pi pi-calculator', '/cash-register'),
          page('Historial de caja', 'pi pi-history', '/cash-register/history'),
        ]),
        group('Cartera', 'pi pi-money-bill', [
          page('Cuentas por cobrar', 'pi pi-money-bill', '/receivables'),
        ]),
        group('Ajustes documentales', 'pi pi-file-edit', [
          page('Notas de crédito', 'pi pi-file-plus', '/credit-notes'),
          page('Notas de débito', 'pi pi-minus-circle', '/debit-notes'),
          page('Devoluciones', 'pi pi-undo', '/returns'),
        ]),
        group('Configuración', 'pi pi-cog', [
          page('Métodos de pago', 'pi pi-credit-card', '/payment-methods'),
        ]),
      ],
      BusinessModule.FINANCE,
    ),
    group(
      'Reportes',
      'pi pi-chart-bar',
      [
        group(
          'Ventas',
          'pi pi-briefcase',
          [
            report('Reporte de Presupuestos PDF', 'pi pi-file-pdf', callbacks.openQuotesPdfModal),
            report('Reporte de Pedidos PDF', 'pi pi-file-pdf', callbacks.openOrdersPdfModal),
            report('Reporte de Facturas PDF', 'pi pi-file-pdf', callbacks.openInvoicesPdfModal),
          ],
          BusinessModule.SALES,
        ),
        group(
          'Compras',
          'pi pi-shopping-cart',
          [report('Reporte de Compras PDF', 'pi pi-file-pdf', callbacks.openPurchasesPdfModal)],
          BusinessModule.PURCHASES,
        ),
        group(
          'Inventario',
          'pi pi-box',
          [
            report('Reporte de Productos PDF', 'pi pi-table', callbacks.openCatalogModal),
            report('Catálogo Comercial PDF', 'pi pi-book', callbacks.openCommercialCatalogModal),
            report('Stock PDF', 'pi pi-warehouse', callbacks.openStockModal),
            report('Movimientos PDF', 'pi pi-arrow-right-arrow-left', callbacks.openMovementsModal),
          ],
          BusinessModule.INVENTORY,
        ),
        group(
          'Finanzas',
          'pi pi-dollar',
          [
            report('Reportes de Caja', 'pi pi-chart-bar', callbacks.openCashRegisterModal),
            report(
              'Cuentas por Cobrar PDF',
              'pi pi-file-pdf',
              callbacks.openAccountsReceivablePdfModal,
            ),
          ],
          BusinessModule.FINANCE,
        ),
      ],
      BusinessModule.DOCUMENT_ADMIN,
    ),
    {
      label: 'Administración',
      icon: 'pi pi-cog',
      allowedRoles: ['SUPER_ADMIN'],
      children: [
        {
          ...group(
            'Seguridad y acceso',
            'pi pi-shield',
            [{ ...page('Usuarios', 'pi pi-user', '/users'), allowedRoles: ['SUPER_ADMIN'] }],
            BusinessModule.USERS,
          ),
          allowedRoles: ['SUPER_ADMIN'],
        },
      ],
    },
  ];
}
