import { MenuItem } from '@core/layouts/models';

export interface MenuCallbacks {
  openCatalogModal: () => void;
}

export function buildMenuItems(callbacks: MenuCallbacks): MenuItem[] {
  return [
    {
      label: 'Gestión de Usuarios',
      icon: 'pi pi-users',
      allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
      children: [
        {
          label: 'Usuarios',
          icon: 'pi pi-user',
          routerLink: '/users',
          allowedRoles: ['SUPER_ADMIN'],
        },
        {
          label: 'Clientes',
          icon: 'pi pi-id-card',
          routerLink: '/customers',
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
              label: 'Catálogo',
              icon: 'pi pi-list',
              command: callbacks.openCatalogModal,
              allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'OPERATOR'],
            },
          ],
        },
      ],
    },
  ];
}
