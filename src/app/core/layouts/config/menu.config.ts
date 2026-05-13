import { MenuItem } from '@core/layouts/models';

export interface MenuCallbacks {
  openCatalogModal: () => void;
  openStockModal: () => void;
  openMovementsModal: () => void;
  openOrdersPdfModal: () => void;
  openInvoicesPdfModal: () => void;
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
  ];
}
