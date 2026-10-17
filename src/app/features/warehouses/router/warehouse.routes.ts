import { Routes } from '@angular/router';
import { authGuard } from '@features/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/users/models/enums/business-module.enum';

export const WAREHOUSE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.INVENTORY },
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '@features/warehouses/pages/warehouses-list-page/warehouses-list-page.component'
          ).then((m) => m.WarehousesListPageComponent),
        title: 'Almacenes',
      },
      {
        path: 'new',
        loadComponent: () =>
          import(
            '@features/warehouses/pages/warehouses-form-page/warehouses-form-page.component'
          ).then((m) => m.WarehousesFormPageComponent),
        title: 'Nuevo Almacén',
      },
      {
        path: ':id/stock',
        loadComponent: () =>
          import(
            '@features/warehouses/pages/warehouse-stock-page/warehouse-stock-page.component'
          ).then((m) => m.WarehouseStockPageComponent),
        title: 'Stock de Almacén',
      },
      {
        path: ':id/movements',
        loadComponent: () =>
          import(
            '@features/warehouses/pages/warehouse-movements-page/warehouse-movements-page.component'
          ).then((m) => m.WarehouseMovementsPageComponent),
        title: 'Movimientos de Almacén',
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            '@features/warehouses/pages/warehouses-details-page/warehouses-details-page.component'
          ).then((m) => m.WarehousesDetailsPageComponent),
        title: 'Detalles de Almacén',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import(
            '@features/warehouses/pages/warehouses-form-page/warehouses-form-page.component'
          ).then((m) => m.WarehousesFormPageComponent),
        title: 'Editar Almacén',
      },
    ],
  },
];
