import { MenuItem } from '@core/layouts/models';
import { UserType } from '@features/users/models/enums';

export function buildMenuItems(): MenuItem[] {
  return [
    {
      label: 'Usuarios',
      icon: 'pi pi-users',
      routerLink: '/users',
      allowedRoles: [UserType.ADMIN],
    },
  ];
}
