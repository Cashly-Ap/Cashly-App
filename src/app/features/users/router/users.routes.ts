import { Routes } from '@angular/router';
import { authGuard, adminGuard, modulePermissionGuard } from '@features/auth/guards';
import { BusinessModule } from '@features/users/models/enums';

export const USER_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, adminGuard, modulePermissionGuard],
    data: { module: BusinessModule.USERS },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../pages/users-list-page/users-list-page.component').then(
            (m) => m.UsersListPageComponent,
          ),
        title: 'Usuarios',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('../pages/users-form-page/users-form-page.component').then(
            (m) => m.UsersFormPageComponent,
          ),
        title: 'Nuevo Usuario',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../pages/users-details-page/users-details-page.component').then(
            (m) => m.UsersDetailsPageComponent,
          ),
        title: 'Detalles del Usuario',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('../pages/users-form-page/users-form-page.component').then(
            (m) => m.UsersFormPageComponent,
          ),
        title: 'Editar Usuario',
      },
    ],
  },
];
