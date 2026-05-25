import { MenuItem } from '@core/layouts/models';

export interface MenuCallbacks {
  openCatalogModal: () => void;
  openStockModal: () => void;
  openMovementsModal: () => void;
  openOrdersPdfModal: () => void;
  openInvoicesPdfModal: () => void;
  openQuotesPdfModal: () => void;
}

export function buildMenuItems(callbacks: MenuCallbacks): MenuItem[] {
  return [
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
        },
      ],
    },
    {
      label: 'Gestión Comercial',
      icon: 'pi pi-briefcase',
      allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
      children: [
        {
          label: 'Presupuestos',
          icon: 'pi pi-file-edit',
          routerLink: '/presupuestos',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
        {
          label: 'Pedidos',
          icon: 'pi pi-shopping-cart',
          routerLink: '/pedidos',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
        {
          label: 'Facturas',
          icon: 'pi pi-file',
          routerLink: '/facturas',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
      ],
    },
    {
      label: 'Inventario',
      icon: 'pi pi-box',
      allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
      children: [
        {
          label: 'Categorías',
          icon: 'pi pi-tags',
          routerLink: '/categories',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
        {
          label: 'Tipos de Precios',
          icon: 'pi pi-tag',
          routerLink: '/price-types',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
        {
          label: 'Productos',
          icon: 'pi pi-box',
          routerLink: '/products',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
        {
          label: 'Almacenes',
          icon: 'pi pi-database',
          routerLink: '/warehouses',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
      ],
    },
    {
      label: 'Finanzas',
      icon: 'pi pi-dollar',
      allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
      children: [
        {
          label: 'Métodos de Pago',
          icon: 'pi pi-credit-card',
          routerLink: '/finances',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
        {
          label: 'Cuentas por Cobrar',
          icon: 'pi pi-money-bill',
          routerLink: '/finances/pagos',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
        {
          label: 'Notas de Crédito',
          icon: 'pi pi-file-plus',
          routerLink: '/finances/notas-credito',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
        {
          label: 'Notas de Débito',
          icon: 'pi pi-minus-circle',
          routerLink: '/finances/notas-debito',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
        {
          label: 'Devoluciones',
          icon: 'pi pi-undo',
          routerLink: '/finances/devoluciones',
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
        },
      ],
    },
    {
      label: 'Reportes',
      icon: 'pi pi-chart-bar',
      allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
      children: [
        {
          label: 'Almacén',
          icon: 'pi pi-box',
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
          label: 'Gestión Comercial',
          icon: 'pi pi-briefcase',
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
          label: 'Finanzas',
          icon: 'pi pi-dollar',
          children: [
            {
              label: 'Cuentas por Cobrar PDF',
              icon: 'pi pi-file-pdf',
              allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
              routerLink: '/finances/pagos',
            },
          ],
        },
      ],
    },
  ];
}
