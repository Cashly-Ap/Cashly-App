import { Routes } from '@angular/router';
import { authGuard, homeRedirectGuard } from '@features/auth/guards';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [homeRedirectGuard],
    loadComponent: () =>
      import('@features/auth/pages/login/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'auth',
    loadChildren: () => import('@features/auth/router').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'users',
    loadChildren: () => import('@features/users/router').then((m) => m.USER_ROUTES),
  },
  {
    path: 'customers',
    loadChildren: () => import('@features/customers/router').then((m) => m.CUSTOMER_ROUTES),
  },
  {
    path: 'categories',
    loadChildren: () => import('@features/categories/router').then((m) => m.CATEGORY_ROUTES),
  },
  {
    path: 'price-types',
    loadChildren: () => import('@features/price-types/router').then((m) => m.PRICE_TYPE_ROUTES),
  },
  {
    path: 'products',
    loadChildren: () => import('@features/products/router').then((m) => m.PRODUCT_ROUTES),
  },
  {
    path: 'warehouses',
    loadChildren: () => import('@features/warehouses/router').then((m) => m.WAREHOUSE_ROUTES),
  },
  {
    path: 'orders',
    loadChildren: () => import('@features/orders/router').then((m) => m.ORDER_ROUTES),
  },
  {
    path: 'quotes',
    loadChildren: () => import('@features/quotes/router').then((m) => m.QUOTE_ROUTES),
  },
  {
    path: 'invoices',
    loadChildren: () => import('@features/invoices/router').then((m) => m.INVOICE_ROUTES),
  },
  {
    path: 'reports',
    loadChildren: () => import('@features/reports/router').then((m) => m.REPORTS_ROUTES),
  },
  {
    path: 'payment-methods',
    loadChildren: () => import('@features/payment-methods/router').then((m) => m.PAYMENT_METHOD_ROUTES),
  },
  {
    path: 'payments',
    loadChildren: () => import('@features/payments/router').then((m) => m.PAYMENT_ROUTES),
  },
  {
    path: 'credit-notes',
    loadChildren: () => import('@features/credit-notes/router').then((m) => m.CREDIT_NOTE_ROUTES),
  },
  {
    path: 'debit-notes',
    loadChildren: () => import('@features/debit-notes/router').then((m) => m.DEBIT_NOTE_ROUTES),
  },
  {
    path: 'returns',
    loadChildren: () => import('@features/returns/router').then((m) => m.RETURN_ROUTES),
  },
  {
    path: 'cash-register',
    loadChildren: () => import('@features/cash-register/router').then((m) => m.CASH_REGISTER_ROUTES),
  },
  {
    path: 'receivables',
    loadChildren: () => import('@features/receivables/router').then((m) => m.RECEIVABLES_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
