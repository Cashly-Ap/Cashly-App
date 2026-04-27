import { Routes } from '@angular/router';
import { authGuard, modulePermissionGuard } from '@features/auth/guards';
import { BusinessModule } from '@features/users/models/enums';

export const CATEGORY_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.INVENTORY },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../pages/categories-list-page/categories-list-page.component').then(
            (m) => m.CategoriesListPageComponent,
          ),
        title: 'Categorías',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('../pages/categories-form-page/categories-form-page.component').then(
            (m) => m.CategoriesFormPageComponent,
          ),
        title: 'Nueva Categoría',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../pages/categories-details-page/categories-details-page.component').then(
            (m) => m.CategoriesDetailsPageComponent,
          ),
        title: 'Detalles de Categoría',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('../pages/categories-form-page/categories-form-page.component').then(
            (m) => m.CategoriesFormPageComponent,
          ),
        title: 'Editar Categoría',
      },
    ],
  },
];
