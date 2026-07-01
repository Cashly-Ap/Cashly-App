import { Routes } from '@angular/router';
import { authGuard, modulePermissionGuard } from '@features/auth/guards';
import { BusinessModule } from '@features/users/models/enums';

export const PAYMENT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.FINANCE },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../pages/payment-list-page/payment-list-page.component').then(
            (m) => m.PaymentListPageComponent,
          ),
        title: 'Pagos',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('../pages/payment-form-page/payment-form-page.component').then(
            (m) => m.PaymentFormPageComponent,
          ),
        title: 'Nuevo Pago',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../pages/payment-detail-page/payment-detail-page.component').then(
            (m) => m.PaymentDetailPageComponent,
          ),
        title: 'Detalle de Pago',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('../pages/payment-form-page/payment-form-page.component').then(
            (m) => m.PaymentFormPageComponent,
          ),
        title: 'Editar Pago',
      },
    ],
  },
];
