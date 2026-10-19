import { Routes } from '@angular/router';
import { authGuard } from '../../guards/auth.guard';
import { modulePermissionGuard } from '../../guards/module-permission.guard';
import { BusinessModule } from '../../user/models/enums/business-module.enum';

const page = () => import('../pages/roles-page.component').then((m) => m.RolesPageComponent);

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
