import { Routes } from '@angular/router';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../pages/customers-list-page/customers-list-page.component').then(
        (m) => m.CustomersListPageComponent,
      ),
    title: 'Clientes',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('../pages/customers-form-page/customers-form-page.component').then(
        (m) => m.CustomersFormPageComponent,
      ),
    title: 'Nuevo Cliente',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('../pages/customers-details-page/customers-details-page.component').then(
        (m) => m.CustomersDetailsPageComponent,
      ),
    title: 'Detalles del Cliente',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('../pages/customers-form-page/customers-form-page.component').then(
        (m) => m.CustomersFormPageComponent,
      ),
    title: 'Editar Cliente',
  },
];
