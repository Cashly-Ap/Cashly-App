import { MenuItem } from '@core/layouts/models';

export function buildMenuItems(): MenuItem[] {
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
  ];
}
