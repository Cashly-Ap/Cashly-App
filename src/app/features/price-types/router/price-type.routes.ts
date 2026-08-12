import { Routes } from '@angular/router';
import { authGuard, modulePermissionGuard } from '@features/auth/guards';
import { BusinessModule } from '@features/users/models/enums';

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
            '@features/price-types/pages/price-types-list-page/price-types-list-page.component'
          ).then((m) => m.PriceTypesListPageComponent),
        title: 'Tipos de Precio',
      },
      {
        path: 'new',
        loadComponent: () =>
          import(
            '@features/price-types/pages/price-types-form-page/price-types-form-page.component'
          ).then((m) => m.PriceTypesFormPageComponent),
        title: 'Nuevo Tipo de Precio',
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            '@features/price-types/pages/price-types-details-page/price-types-details-page.component'
          ).then((m) => m.PriceTypesDetailsPageComponent),
        title: 'Detalles de Tipo de Precio',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import(
            '@features/price-types/pages/price-types-form-page/price-types-form-page.component'
          ).then((m) => m.PriceTypesFormPageComponent),
        title: 'Editar Tipo de Precio',
      },
    ],
  },
];
