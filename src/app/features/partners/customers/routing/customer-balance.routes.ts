import { Routes } from '@angular/router';
import { authGuard } from '@features/platform/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/platform/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

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
