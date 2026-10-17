import { Routes } from '@angular/router';
import { authGuard } from '@features/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/users/models/enums/business-module.enum';

export const PAYMENT_METHOD_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.FINANCE },
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '@features/finance/treasury/payment-methods/pages/payment-method-list-page/payment-method-list-page.component'
          ).then((m) => m.PaymentMethodListPageComponent),
        title: 'Métodos de Pago',
      },
      {
        path: 'new',
        loadComponent: () =>
          import(
            '@features/finance/treasury/payment-methods/pages/payment-method-form-page/payment-method-form-page.component'
          ).then((m) => m.PaymentMethodFormPageComponent),
        title: 'Nuevo Método de Pago',
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            '@features/finance/treasury/payment-methods/pages/payment-method-detail-page/payment-method-detail-page.component'
          ).then((m) => m.PaymentMethodDetailPageComponent),
        title: 'Detalle de Método de Pago',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import(
            '@features/finance/treasury/payment-methods/pages/payment-method-form-page/payment-method-form-page.component'
          ).then((m) => m.PaymentMethodFormPageComponent),
        title: 'Editar Método de Pago',
      },
    ],
  },
];
