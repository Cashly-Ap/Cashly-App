import { Routes } from '@angular/router';
import { authGuard } from '@features/platform/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/platform/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export const PRICE_TYPE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.INVENTORY },
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '@features/catalog/price-types/pages/price-types-list-page/price-types-list-page.component'
          ).then((m) => m.PriceTypesListPageComponent),
        title: 'Tipos de Precio',
      },
      {
        path: 'new',
        loadComponent: () =>
          import(
            '@features/catalog/price-types/pages/price-types-form-page/price-types-form-page.component'
          ).then((m) => m.PriceTypesFormPageComponent),
        title: 'Nuevo Tipo de Precio',
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            '@features/catalog/price-types/pages/price-types-details-page/price-types-details-page.component'
          ).then((m) => m.PriceTypesDetailsPageComponent),
        title: 'Detalles de Tipo de Precio',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import(
            '@features/catalog/price-types/pages/price-types-form-page/price-types-form-page.component'
          ).then((m) => m.PriceTypesFormPageComponent),
        title: 'Editar Tipo de Precio',
      },
    ],
  },
];
