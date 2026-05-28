import { Routes } from '@angular/router';
import { authGuard, modulePermissionGuard } from '@features/auth/guards';
import { BusinessModule } from '@features/users/models/enums';

export const PAYMENT_METHOD_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.FINANCE },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../pages/payment-method-list-page/payment-method-list-page.component').then(
            (m) => m.PaymentMethodListPageComponent,
          ),
        title: 'Payment Methods',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('../pages/payment-method-form-page/payment-method-form-page.component').then(
            (m) => m.PaymentMethodFormPageComponent,
          ),
        title: 'New Payment Method',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../pages/payment-method-detail-page/payment-method-detail-page.component').then(
            (m) => m.PaymentMethodDetailPageComponent,
          ),
        title: 'Payment Method Detail',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('../pages/payment-method-form-page/payment-method-form-page.component').then(
            (m) => m.PaymentMethodFormPageComponent,
          ),
        title: 'Edit Payment Method',
      },
    ],
  },
];
