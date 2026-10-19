import { Routes } from '@angular/router';
import { authGuard } from '@features/platform/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/platform/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export const RECEIVABLES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.FINANCE },
    canActivateChild: [modulePermissionGuard],
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
