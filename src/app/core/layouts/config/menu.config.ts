import { MenuItem } from '@core/layouts/models';

export function buildMenuItems(): MenuItem[] {
  return [
    {
      label: 'Usuarios',
      icon: 'pi pi-users',
      routerLink: '/users',
      allowedRoles: ['SUPER_ADMIN'],
    },
  ];
}
