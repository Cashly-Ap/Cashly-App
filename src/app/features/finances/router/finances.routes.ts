import { Routes } from '@angular/router';
import { authGuard, modulePermissionGuard } from '@features/auth/guards';
import { BusinessModule } from '@features/users/models/enums';

export const FINANCES_ROUTES: Routes = [
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
        title: 'Métodos de Pago',
      },
      {
        path: 'nuevo',
        loadComponent: () =>
          import('../pages/payment-method-form-page/payment-method-form-page.component').then(
            (m) => m.PaymentMethodFormPageComponent,
          ),
        title: 'Nuevo Método de Pago',
      },

      {
        path: 'pagos',
        loadComponent: () =>
          import('../pages/payment-list-page/payment-list-page.component').then(
            (m) => m.PaymentListPageComponent,
          ),
        title: 'Cuentas por Cobrar',
      },
      {
        path: 'pagos/nuevo',
        loadComponent: () =>
          import('../pages/payment-form-page/payment-form-page.component').then(
            (m) => m.PaymentFormPageComponent,
          ),
        title: 'Nuevo Pago',
      },
      {
        path: 'pagos/:id',
        loadComponent: () =>
          import('../pages/payment-detail-page/payment-detail-page.component').then(
            (m) => m.PaymentDetailPageComponent,
          ),
        title: 'Detalle del Pago',
      },
      {
        path: 'pagos/:id/editar',
        loadComponent: () =>
          import('../pages/payment-form-page/payment-form-page.component').then(
            (m) => m.PaymentFormPageComponent,
          ),
        title: 'Editar Pago',
      },
      {
        path: 'notas-credito',
        loadComponent: () =>
          import('../pages/credit-note-list-page/credit-note-list-page.component').then(
            (m) => m.CreditNoteListPageComponent,
          ),
        title: 'Notas de Crédito',
      },
      {
        path: 'notas-credito/nuevo',
        loadComponent: () =>
          import('../pages/credit-note-form-page/credit-note-form-page.component').then(
            (m) => m.CreditNoteFormPageComponent,
          ),
        title: 'Nueva Nota de Crédito',
      },
      {
        path: 'notas-credito/:id',
        loadComponent: () =>
          import('../pages/credit-note-detail-page/credit-note-detail-page.component').then(
            (m) => m.CreditNoteDetailPageComponent,
          ),
        title: 'Detalle de Nota de Crédito',
      },
      {
        path: 'notas-debito',
        loadComponent: () =>
          import('../pages/debit-note-list-page/debit-note-list-page.component').then(
            (m) => m.DebitNoteListPageComponent,
          ),
        title: 'Notas de Débito',
      },
      {
        path: 'notas-debito/nuevo',
        loadComponent: () =>
          import('../pages/debit-note-form-page/debit-note-form-page.component').then(
            (m) => m.DebitNoteFormPageComponent,
          ),
        title: 'Nueva Nota de Débito',
      },
      {
        path: 'notas-debito/:id',
        loadComponent: () =>
          import('../pages/debit-note-detail-page/debit-note-detail-page.component').then(
            (m) => m.DebitNoteDetailPageComponent,
          ),
        title: 'Detalle de Nota de Débito',
      },
      {
        path: 'devoluciones',
        loadComponent: () =>
          import('../pages/return-list-page/return-list-page.component').then(
            (m) => m.ReturnListPageComponent,
          ),
        title: 'Devoluciones',
      },
      {
        path: 'devoluciones/nuevo',
        loadComponent: () =>
          import('../pages/return-form-page/return-form-page.component').then(
            (m) => m.ReturnFormPageComponent,
          ),
        title: 'Nueva Devolución',
      },
      {
        path: 'devoluciones/:id',
        loadComponent: () =>
          import('../pages/return-detail-page/return-detail-page.component').then(
            (m) => m.ReturnDetailPageComponent,
          ),
        title: 'Detalle de Devolución',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../pages/payment-method-detail-page/payment-method-detail-page.component').then(
            (m) => m.PaymentMethodDetailPageComponent,
          ),
        title: 'Detalle del Método de Pago',
      },
      {
        path: ':id/editar',
        loadComponent: () =>
          import('../pages/payment-method-form-page/payment-method-form-page.component').then(
            (m) => m.PaymentMethodFormPageComponent,
          ),
        title: 'Editar Método de Pago',
      },
    ],
  },
];
