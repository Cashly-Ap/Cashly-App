import { Routes } from '@angular/router';
import { authGuard, modulePermissionGuard } from '@features/auth/guards';
import { BusinessModule } from '@features/users/models/enums';

export const CASH_REGISTER_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.FINANCE },
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '../pages/cash-register-page/cash-register-page.component'
          ).then((m) => m.CashRegisterPageComponent),
        title: 'Caja',
      },
    ],
  },
];
