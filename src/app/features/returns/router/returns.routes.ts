import { Routes } from '@angular/router';
import { authGuard, modulePermissionGuard } from '@features/auth/guards';
import { BusinessModule } from '@features/users/models/enums';

export const RETURN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.SALES },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../pages/return-list-page/return-list-page.component').then(
            (m) => m.ReturnListPageComponent,
          ),
        title: 'Devoluciones',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('../pages/return-form-page/return-form-page.component').then(
            (m) => m.ReturnFormPageComponent,
          ),
        title: 'Nueva Devolución',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../pages/return-detail-page/return-detail-page.component').then(
            (m) => m.ReturnDetailPageComponent,
          ),
        title: 'Detalle de Devolución',
      },
    ],
  },
];
