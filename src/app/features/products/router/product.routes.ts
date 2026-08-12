import { Routes } from '@angular/router';
import { authGuard, modulePermissionGuard } from '@features/auth/guards';
import { BusinessModule } from '@features/users/models/enums';

export const PRODUCT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.INVENTORY },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/products/pages/products-list-page/products-list-page.component').then(
            (m) => m.ProductsListPageComponent,
          ),
        title: 'Productos',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('@features/products/pages/products-form-page/products-form-page.component').then(
            (m) => m.ProductsFormPageComponent,
          ),
        title: 'Nuevo Producto',
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            '@features/products/pages/products-details-page/products-details-page.component'
          ).then((m) => m.ProductsDetailsPageComponent),
        title: 'Detalles de Producto',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('@features/products/pages/products-form-page/products-form-page.component').then(
            (m) => m.ProductsFormPageComponent,
          ),
        title: 'Editar Producto',
      },
    ],
  },
];
