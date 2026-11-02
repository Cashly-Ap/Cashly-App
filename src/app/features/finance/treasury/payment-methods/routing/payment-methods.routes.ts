import { Routes } from '@angular/router';
import { authGuard } from '@features/platform/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/platform/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export const PAYMENT_METHOD_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.FINANCE_PAYMENT_METHODS },
    canActivateChild: [modulePermissionGuard],
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
