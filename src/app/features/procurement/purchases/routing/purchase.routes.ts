import { Routes } from '@angular/router';
import { authGuard } from '@features/platform/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/platform/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export const PURCHASE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.PURCHASES },
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '@features/procurement/purchases/pages/purchase-list-page/purchase-list-page.component'
          ).then((m) => m.PurchaseListPageComponent),
        title: 'Compras',
      },
      {
        path: 'new',
        loadComponent: () =>
          import(
            '@features/procurement/purchases/pages/purchase-form-page/purchase-form-page.component'
          ).then((m) => m.PurchaseFormPageComponent),
        title: 'Nueva Compra',
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            '@features/procurement/purchases/pages/purchase-detail-page/purchase-detail-page.component'
          ).then((m) => m.PurchaseDetailPageComponent),
        title: 'Detalle de la Compra',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import(
            '@features/procurement/purchases/pages/purchase-form-page/purchase-form-page.component'
          ).then((m) => m.PurchaseFormPageComponent),
        title: 'Editar Compra',
      },
    ],
  },
];
