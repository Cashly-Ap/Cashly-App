import { MenuItem } from '@core/layouts/models';

export function buildMenuItems(): MenuItem[] {
  return [
    {
      label: 'Gestión de Usuarios',
      icon: 'pi pi-users',
      allowedRoles: ['SUPER_ADMIN', 'ADMINISTRATION', 'OPERATOR'],
      children: [
        {
          label: 'Clientes',
          icon: 'pi pi-id-card',
          routerLink: '/customers',
        },
        {
          label: 'Usuarios',
          icon: 'pi pi-user',
          routerLink: '/users',
          allowedRoles: ['SUPER_ADMIN'],
        },
      ],
    },
  ];
}
