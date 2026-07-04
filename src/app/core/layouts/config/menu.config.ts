import { MenuItem } from '@core/layouts/models';
import { BusinessModule } from '@features/users/models/enums';

export interface MenuCallbacks {
  openCatalogModal: () => void;
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
  return [
    {
      label: 'Dashboard',
      icon: 'pi pi-chart-line',
      routerLink: '/dashboard',
      allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
      requiredModule: BusinessModule.DASHBOARD,
    },
    {
      label: 'Gestión de Usuarios',
      icon: 'pi pi-users',
      allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
      children: [
        {
          label: 'Clientes',
          icon: 'pi pi-id-card',
          routerLink: '/customers',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
        {
          label: 'Usuarios',
          icon: 'pi pi-user',
          routerLink: '/users',
          allowedRoles: ['SUPER_ADMIN'],
          requiredModule: BusinessModule.USERS,
        },
      ],
    },
    {
      label: 'Gestión Comercial',
      icon: 'pi pi-briefcase',
      allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
      requiredModule: BusinessModule.SALES,
      children: [
        {
          label: 'Presupuestos',
          icon: 'pi pi-file-edit',
          routerLink: '/quotes',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
        {
          label: 'Pedidos',
          icon: 'pi pi-shopping-cart',
          routerLink: '/orders',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
        {
          label: 'Facturas',
          icon: 'pi pi-file',
          routerLink: '/invoices',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
      ],
    },
    {
      label: 'Inventario',
      icon: 'pi pi-box',
      allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
      requiredModule: BusinessModule.INVENTORY,
      children: [
        {
          label: 'Tipos de Precios',
          icon: 'pi pi-tag',
          routerLink: '/price-types',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
        {
          label: 'Categorías',
          icon: 'pi pi-tags',
          routerLink: '/categories',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
        {
          label: 'Almacenes',
          icon: 'pi pi-database',
          routerLink: '/warehouses',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
        {
          label: 'Productos',
          icon: 'pi pi-box',
          routerLink: '/products',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
      ],
    },
    {
      label: 'Compras',
      icon: 'pi pi-shopping-cart',
      allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
      requiredModule: BusinessModule.PURCHASES,
      children: [
        {
          label: 'Proveedores',
          icon: 'pi pi-truck',
          routerLink: '/suppliers',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
        {
          label: 'Compras',
          icon: 'pi pi-shopping-cart',
          routerLink: '/purchases',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
      ],
    },
    {
      label: 'Finanzas',
      icon: 'pi pi-dollar',
      allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
      requiredModule: BusinessModule.FINANCE,
      children: [
        {
          label: 'Caja',
          icon: 'pi pi-calculator',
          routerLink: '/cash-register',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
        {
          label: 'Cuentas por Cobrar',
          icon: 'pi pi-money-bill',
          routerLink: '/receivables',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
        {
          label: 'Métodos de Pago',
          icon: 'pi pi-credit-card',
          routerLink: '/payment-methods',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
        {
          label: 'Notas de Crédito',
          icon: 'pi pi-file-plus',
          routerLink: '/credit-notes',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
        {
          label: 'Notas de Débito',
          icon: 'pi pi-minus-circle',
          routerLink: '/debit-notes',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
        {
          label: 'Devoluciones',
          icon: 'pi pi-undo',
          routerLink: '/returns',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
      ],
    },
    {
      label: 'Reportes',
      icon: 'pi pi-chart-bar',
      allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
      requiredModule: BusinessModule.DOCUMENT_ADMIN,
      children: [
        {
          label: 'Gestión Comercial',
          icon: 'pi pi-briefcase',
          requiredModule: BusinessModule.SALES,
          children: [
            {
              label: 'Presupuestos',
              icon: 'pi pi-file-edit',
              children: [
                {
                  label: 'Reporte de Presupuestos PDF',
                  icon: 'pi pi-file-pdf',
                  allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
                  command: () => callbacks.openQuotesPdfModal(),
                },
              ],
            },
            {
              label: 'Pedidos',
              icon: 'pi pi-shopping-cart',
              children: [
                {
                  label: 'Reporte de Pedidos PDF',
                  icon: 'pi pi-file-pdf',
                  allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
                  command: () => callbacks.openOrdersPdfModal(),
                },
              ],
            },
            {
              label: 'Facturas',
              icon: 'pi pi-file',
              children: [
                {
                  label: 'Reporte de Facturas PDF',
                  icon: 'pi pi-file-pdf',
                  allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
                  command: () => callbacks.openInvoicesPdfModal(),
                },
              ],
            },
          ],
        },
        {
          label: 'Almacén',
          icon: 'pi pi-box',
          requiredModule: BusinessModule.INVENTORY,
          children: [
            {
              label: 'Catálogo PDF',
              icon: 'pi pi-book',
              allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
              command: () => callbacks.openCatalogModal(),
            },
            {
              label: 'Stock PDF',
              icon: 'pi pi-warehouse',
              allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
              command: () => callbacks.openStockModal(),
            },
            {
              label: 'Movimientos PDF',
              icon: 'pi pi-arrow-right-arrow-left',
              allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
              command: () => callbacks.openMovementsModal(),
            },
          ],
        },
        {
          label: 'Compras',
          icon: 'pi pi-shopping-cart',
          requiredModule: BusinessModule.PURCHASES,
          children: [
            {
              label: 'Reporte de Compras PDF',
              icon: 'pi pi-file-pdf',
              allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
              command: () => callbacks.openPurchasesPdfModal(),
            },
          ],
        },
        {
          label: 'Finanzas',
          icon: 'pi pi-dollar',
          requiredModule: BusinessModule.FINANCE,
          children: [
            {
              label: 'Cuentas por Cobrar PDF',
              icon: 'pi pi-file-pdf',
              allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
              command: () => callbacks.openAccountsReceivablePdfModal(),
            },
            {
              label: 'Caja',
              icon: 'pi pi-calculator',
              allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
              command: () => callbacks.openCashRegisterModal(),
            },
          ],
        },
      ],
    },
  ];
}
