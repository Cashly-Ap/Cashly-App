import { Routes } from '@angular/router';
import { authGuard } from '@features/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/users/models/enums/business-module.enum';

export const ORDER_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.SALES },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/orders/pages/order-list-page/order-list-page.component').then(
            (m) => m.OrderListPageComponent,
          ),
        title: 'Pedidos',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('@features/orders/pages/order-form-page/order-form-page.component').then(
            (m) => m.OrderFormPageComponent,
          ),
        title: 'Nuevo Pedido',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('@features/orders/pages/order-detail-page/order-detail-page.component').then(
            (m) => m.OrderDetailPageComponent,
          ),
        title: 'Detalle del Pedido',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('@features/orders/pages/order-form-page/order-form-page.component').then(
            (m) => m.OrderFormPageComponent,
          ),
        title: 'Editar Pedido',
      },
    ],
  },
];
