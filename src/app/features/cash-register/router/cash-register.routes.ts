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
            '@features/cash-register/pages/cash-register-page/cash-register-page.component'
          ).then((m) => m.CashRegisterPageComponent),
        title: 'Caja',
      },
      {
        path: 'history',
        loadComponent: () =>
          import(
            '@features/cash-register/pages/cash-register-history-page/cash-register-history-page.component'
          ).then((m) => m.CashRegisterHistoryPageComponent),
        title: 'Historial de Caja',
      },
    ],
  },
];
