import { Routes } from '@angular/router';
import { authGuard, modulePermissionGuard } from '@features/auth/guards';
import { BusinessModule } from '@features/users/models/enums';

export const WAREHOUSE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.INVENTORY },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../pages/warehouses-list-page/warehouses-list-page.component').then(
            (m) => m.WarehousesListPageComponent,
          ),
        title: 'Almacenes',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('../pages/warehouses-form-page/warehouses-form-page.component').then(
            (m) => m.WarehousesFormPageComponent,
          ),
        title: 'Nuevo Almacén',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../pages/warehouses-details-page/warehouses-details-page.component').then(
            (m) => m.WarehousesDetailsPageComponent,
          ),
        title: 'Detalles de Almacén',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('../pages/warehouses-form-page/warehouses-form-page.component').then(
            (m) => m.WarehousesFormPageComponent,
          ),
        title: 'Editar Almacén',
      },
    ],
  },
];
