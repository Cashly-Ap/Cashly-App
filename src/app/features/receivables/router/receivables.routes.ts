import { Routes } from '@angular/router';
import { authGuard, modulePermissionGuard } from '@features/auth/guards';
import { BusinessModule } from '@features/users/models/enums';

export const RECEIVABLES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.FINANCE },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../pages/receivables-page/receivables-page.component').then(
            (m) => m.ReceivablesPageComponent,
          ),
        title: 'Cuentas por Cobrar',
      },
    ],
  },
];
