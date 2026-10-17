import { Routes } from '@angular/router';
import { authGuard } from '@features/auth/guards/auth.guard';
import { adminGuard } from '@features/auth/guards/admin.guard';
import { modulePermissionGuard } from '@features/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/users/models/enums/business-module.enum';

export const USER_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, adminGuard, modulePermissionGuard],
    data: { module: BusinessModule.USERS },
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '@features/users/pages/users-list-page/users-list-page.component'
          ).then((m) => m.UsersListPageComponent),
        title: 'Usuarios',
      },
      {
        path: 'new',
        loadComponent: () =>
          import(
            '@features/users/pages/users-form-page/users-form-page.component'
          ).then((m) => m.UsersFormPageComponent),
        title: 'Nuevo Usuario',
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            '@features/users/pages/users-details-page/users-details-page.component'
          ).then((m) => m.UsersDetailsPageComponent),
        title: 'Detalles del Usuario',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import(
            '@features/users/pages/users-form-page/users-form-page.component'
          ).then((m) => m.UsersFormPageComponent),
        title: 'Editar Usuario',
      },
    ],
  },
];
