import { Routes } from '@angular/router';
import { authGuard } from '@features/platform/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/platform/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

const page = () =>
  import('@features/platform/auth/role/pages/roles-page.component').then(
    (m) => m.RolesPageComponent,
  );

export const ROLES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    canActivateChild: [modulePermissionGuard],
    data: { module: BusinessModule.ROLES },
    children: [
      { path: '', loadComponent: page, title: 'Roles', data: { view: 'list', action: 'READ' } },
      {
        path: 'new',
        loadComponent: page,
        title: 'Nuevo Rol',
        data: { view: 'form', action: 'CREATE' },
      },
      {
        path: ':id',
        loadComponent: page,
        title: 'Detalles del Rol',
        data: { view: 'detail', action: 'READ' },
      },
      {
        path: ':id/edit',
        loadComponent: page,
        title: 'Editar Rol',
        data: { view: 'form', action: 'UPDATE' },
      },
    ],
  },
];
