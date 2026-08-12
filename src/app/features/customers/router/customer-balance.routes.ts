import { Routes } from '@angular/router';
import { authGuard, modulePermissionGuard } from '@features/auth/guards';
import { BusinessModule } from '@features/users/models/enums';

export const customerBalanceRoutes: Routes = [
  {
    path: ':id/balance',
    loadComponent: () =>
      import(
        '@features/customers/pages/customer-balance-page/customer-balance-page.component'
      ).then((m) => m.CustomerBalancePageComponent),
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.FINANCE },
    title: 'Saldo del Cliente',
  },
];
