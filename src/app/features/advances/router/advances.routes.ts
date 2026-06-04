import { Routes } from '@angular/router';
import { authGuard, modulePermissionGuard } from '@features/auth/guards';
import { BusinessModule } from '@features/users/models/enums';

export const ADVANCE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.FINANCE },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../pages/advance-list-page/advance-list-page.component').then(
            (m) => m.AdvanceListPageComponent
          ),
        title: 'Anticipos',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('../pages/advance-form-page/advance-form-page.component').then(
            (m) => m.AdvanceFormPageComponent
          ),
        title: 'Nuevo Anticipo',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../pages/advance-detail-page/advance-detail-page.component').then(
            (m) => m.AdvanceDetailPageComponent
          ),
        title: 'Detalle del Anticipo',
      },
    ],
  },
];
