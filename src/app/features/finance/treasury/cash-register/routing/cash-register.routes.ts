import { Routes } from '@angular/router';
import { authGuard } from '@features/platform/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/platform/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

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
            '@features/finance/treasury/cash-register/pages/cash-register-page/cash-register-page.component'
          ).then((m) => m.CashRegisterPageComponent),
        title: 'Caja',
      },
      {
        path: 'history',
        loadComponent: () =>
          import(
            '@features/finance/treasury/cash-register/pages/cash-register-history-page/cash-register-history-page.component'
          ).then((m) => m.CashRegisterHistoryPageComponent),
        title: 'Historial de Caja',
      },
    ],
  },
];
