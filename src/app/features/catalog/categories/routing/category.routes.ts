import { Routes } from '@angular/router';
import { authGuard } from '@features/platform/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/platform/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export const CATEGORY_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.CATALOG },
    canActivateChild: [modulePermissionGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '@features/catalog/categories/pages/categories-list-page/categories-list-page.component'
          ).then((m) => m.CategoriesListPageComponent),
        title: 'Categorías',
      },
      {
        path: 'new',
        loadComponent: () =>
          import(
            '@features/catalog/categories/pages/categories-form-page/categories-form-page.component'
          ).then((m) => m.CategoriesFormPageComponent),
        title: 'Nueva Categoría',
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            '@features/catalog/categories/pages/categories-details-page/categories-details-page.component'
          ).then((m) => m.CategoriesDetailsPageComponent),
        title: 'Detalles de Categoría',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import(
            '@features/catalog/categories/pages/categories-form-page/categories-form-page.component'
          ).then((m) => m.CategoriesFormPageComponent),
        title: 'Editar Categoría',
      },
    ],
  },
];
