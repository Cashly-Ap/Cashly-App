import { Routes } from '@angular/router';
import { authGuard } from '@features/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/users/models/enums/business-module.enum';

export const customerBalanceRoutes: Routes = [
  {
    path: ':id/balance',
    loadComponent: () =>
      import(
        '@features/partners/customers/pages/customer-balance-page/customer-balance-page.component'
      ).then((m) => m.CustomerBalancePageComponent),
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.FINANCE },
    title: 'Saldo del Cliente',
  },
];
