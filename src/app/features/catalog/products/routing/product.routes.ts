import { Routes } from '@angular/router';
import { authGuard } from '@features/platform/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/platform/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export const PRODUCT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.CATALOG_PRODUCTS },
    canActivateChild: [modulePermissionGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '@features/catalog/products/pages/products-list-page/products-list-page.component'
          ).then((m) => m.ProductsListPageComponent),
        title: 'Productos',
      },
      {
        path: 'new',
        loadComponent: () =>
          import(
            '@features/catalog/products/pages/products-form-page/products-form-page.component'
          ).then((m) => m.ProductsFormPageComponent),
        title: 'Nuevo Producto',
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            '@features/catalog/products/pages/products-details-page/products-details-page.component'
          ).then((m) => m.ProductsDetailsPageComponent),
        title: 'Detalles de Producto',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import(
            '@features/catalog/products/pages/products-form-page/products-form-page.component'
          ).then((m) => m.ProductsFormPageComponent),
        title: 'Editar Producto',
      },
    ],
  },
];
