import { Routes } from '@angular/router';
import { authGuard } from '@features/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/users/models/enums/business-module.enum';

export const RECEIVABLES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.FINANCE },
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '@features/finance/treasury/receivables/pages/receivables-page/receivables-page.component'
          ).then((m) => m.ReceivablesPageComponent),
        title: 'Cuentas por Cobrar',
      },
    ],
  },
];
