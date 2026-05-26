import { Routes } from '@angular/router';
import { authGuard, modulePermissionGuard } from '@features/auth/guards';
import { BusinessModule } from '@features/users/models/enums';

const GUARDS = [authGuard, modulePermissionGuard];
const MODULE_DATA = { module: BusinessModule.FINANCE };

export const PAYMENT_METHOD_ROUTES: Routes = [
  {
    path: '',
    canActivate: GUARDS,
    data: MODULE_DATA,
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

export const PAYMENT_ROUTES: Routes = [
  {
    path: '',
    canActivate: GUARDS,
    data: MODULE_DATA,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../pages/payment-list-page/payment-list-page.component').then(
            (m) => m.PaymentListPageComponent,
          ),
        title: 'Payments',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('../pages/payment-form-page/payment-form-page.component').then(
            (m) => m.PaymentFormPageComponent,
          ),
        title: 'New Payment',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../pages/payment-detail-page/payment-detail-page.component').then(
            (m) => m.PaymentDetailPageComponent,
          ),
        title: 'Payment Detail',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('../pages/payment-form-page/payment-form-page.component').then(
            (m) => m.PaymentFormPageComponent,
          ),
        title: 'Edit Payment',
      },
    ],
  },
];

export const CREDIT_NOTE_ROUTES: Routes = [
  {
    path: '',
    canActivate: GUARDS,
    data: MODULE_DATA,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../pages/credit-note-list-page/credit-note-list-page.component').then(
            (m) => m.CreditNoteListPageComponent,
          ),
        title: 'Credit Notes',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('../pages/credit-note-form-page/credit-note-form-page.component').then(
            (m) => m.CreditNoteFormPageComponent,
          ),
        title: 'New Credit Note',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../pages/credit-note-detail-page/credit-note-detail-page.component').then(
            (m) => m.CreditNoteDetailPageComponent,
          ),
        title: 'Credit Note Detail',
      },
    ],
  },
];

export const DEBIT_NOTE_ROUTES: Routes = [
  {
    path: '',
    canActivate: GUARDS,
    data: MODULE_DATA,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../pages/debit-note-list-page/debit-note-list-page.component').then(
            (m) => m.DebitNoteListPageComponent,
          ),
        title: 'Debit Notes',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('../pages/debit-note-form-page/debit-note-form-page.component').then(
            (m) => m.DebitNoteFormPageComponent,
          ),
        title: 'New Debit Note',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../pages/debit-note-detail-page/debit-note-detail-page.component').then(
            (m) => m.DebitNoteDetailPageComponent,
          ),
        title: 'Debit Note Detail',
      },
    ],
  },
];

export const RETURN_ROUTES: Routes = [
  {
    path: '',
    canActivate: GUARDS,
    data: MODULE_DATA,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../pages/return-list-page/return-list-page.component').then(
            (m) => m.ReturnListPageComponent,
          ),
        title: 'Returns',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('../pages/return-form-page/return-form-page.component').then(
            (m) => m.ReturnFormPageComponent,
          ),
        title: 'New Return',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../pages/return-detail-page/return-detail-page.component').then(
            (m) => m.ReturnDetailPageComponent,
          ),
        title: 'Return Detail',
      },
    ],
  },
];
