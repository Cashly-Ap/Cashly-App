import { Routes } from '@angular/router';
import { authGuard, modulePermissionGuard } from '@features/auth/guards';
import { BusinessModule } from '@features/users/models/enums';

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
            '@features/customers/pages/customers-list-page/customers-list-page.component'
          ).then((m) => m.CustomersListPageComponent),
        title: 'Clientes',
      },
      {
        path: 'new',
        loadComponent: () =>
          import(
            '@features/customers/pages/customers-form-page/customers-form-page.component'
          ).then((m) => m.CustomersFormPageComponent),
        title: 'Nuevo Cliente',
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            '@features/customers/pages/customers-details-page/customers-details-page.component'
          ).then((m) => m.CustomersDetailsPageComponent),
        title: 'Detalles del Cliente',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import(
            '@features/customers/pages/customers-form-page/customers-form-page.component'
          ).then((m) => m.CustomersFormPageComponent),
        title: 'Editar Cliente',
      },
      {
        path: ':id/balance',
        loadComponent: () =>
          import(
            '@features/customers/pages/customer-balance-page/customer-balance-page.component'
          ).then((m) => m.CustomerBalancePageComponent),
        data: { module: BusinessModule.FINANCE },
        title: 'Saldo del Cliente',
      },
    ],
  },
];
