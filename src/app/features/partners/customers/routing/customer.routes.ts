import { Routes } from '@angular/router';
import { authGuard } from '@features/platform/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/platform/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.SALES },
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '@features/partners/customers/pages/customers-list-page/customers-list-page.component'
          ).then((m) => m.CustomersListPageComponent),
        title: 'Clientes',
      },
      {
        path: 'new',
        loadComponent: () =>
          import(
            '@features/partners/customers/pages/customers-form-page/customers-form-page.component'
          ).then((m) => m.CustomersFormPageComponent),
        title: 'Nuevo Cliente',
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            '@features/partners/customers/pages/customers-details-page/customers-details-page.component'
          ).then((m) => m.CustomersDetailsPageComponent),
        title: 'Detalles del Cliente',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import(
            '@features/partners/customers/pages/customers-form-page/customers-form-page.component'
          ).then((m) => m.CustomersFormPageComponent),
        title: 'Editar Cliente',
      },
      {
        path: ':id/balance',
        loadComponent: () =>
          import(
            '@features/partners/customers/pages/customer-balance-page/customer-balance-page.component'
          ).then((m) => m.CustomerBalancePageComponent),
        data: { module: BusinessModule.FINANCE },
        title: 'Saldo del Cliente',
      },
    ],
  },
];
