import { Routes } from '@angular/router';
import { authGuard } from '@features/platform/auth/guards/auth.guard';
import { homeRedirectGuard } from '@features/platform/auth/guards/home-redirect.guard';
import { modulePermissionGuard } from '@features/platform/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [homeRedirectGuard],
    loadComponent: () =>
      import('@features/platform/auth/pages/login/login-page.component').then(
        (m) => m.LoginPageComponent,
      ),
  },
  {
    path: 'auth',
    loadChildren: () => import('@features/platform/auth/routing').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    loadComponent: () =>
      import('@core/layouts/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: 'auth',
        loadChildren: () =>
          import('@features/platform/auth/routing').then((m) => m.AUTHENTICATED_AUTH_ROUTES),
      },
      {
        path: 'dashboard',
        canActivate: [authGuard, modulePermissionGuard],
        data: { module: BusinessModule.DASHBOARD },
        loadComponent: () =>
          import(
            '@features/dashboard/pages/dashboard-page/dashboard-page.component'
          ).then((m) => m.DashboardPageComponent),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('@features/platform/auth/user/routing').then((m) => m.USER_ROUTES),
      },
      {
        path: 'customers',
        loadChildren: () =>
          import('@features/partners/customers/routing').then((m) => m.CUSTOMER_ROUTES),
      },
      {
        path: 'suppliers',
        loadChildren: () =>
          import('@features/partners/suppliers/routing').then((m) => m.SUPPLIER_ROUTES),
      },
      {
        path: 'purchases',
        loadChildren: () =>
          import('@features/procurement/purchases/routing').then((m) => m.PURCHASE_ROUTES),
      },
      {
        path: 'categories',
        loadChildren: () =>
          import('@features/catalog/categories/routing').then((m) => m.CATEGORY_ROUTES),
      },
      {
        path: 'price-types',
        loadChildren: () =>
          import('@features/catalog/price-types/routing').then((m) => m.PRICE_TYPE_ROUTES),
      },
      {
        path: 'products',
        loadChildren: () =>
          import('@features/catalog/products/routing').then((m) => m.PRODUCT_ROUTES),
      },
      {
        path: 'warehouses',
        loadChildren: () =>
          import('@features/inventory/warehouses/routing').then((m) => m.WAREHOUSE_ROUTES),
      },
      {
        path: 'orders',
        loadChildren: () => import('@features/sales/orders/routing').then((m) => m.ORDER_ROUTES),
      },
      {
        path: 'quotes',
        loadChildren: () => import('@features/sales/quotes/routing').then((m) => m.QUOTE_ROUTES),
      },
      {
        path: 'invoices',
        loadChildren: () =>
          import('@features/finance/billing/invoices/routing').then((m) => m.INVOICE_ROUTES),
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('@features/reports/router').then((m) => m.REPORTS_ROUTES),
      },
      {
        path: 'payment-methods',
        loadChildren: () =>
          import('@features/finance/treasury/payment-methods/routing').then(
            (m) => m.PAYMENT_METHOD_ROUTES,
          ),
      },
      {
        path: 'credit-notes',
        loadChildren: () =>
          import('@features/finance/billing/credit-notes/routing').then(
            (m) => m.CREDIT_NOTE_ROUTES,
          ),
      },
      {
        path: 'debit-notes',
        loadChildren: () =>
          import('@features/finance/billing/debit-notes/routing').then((m) => m.DEBIT_NOTE_ROUTES),
      },
      {
        path: 'returns',
        loadChildren: () =>
          import('@features/finance/billing/returns/routing').then((m) => m.RETURN_ROUTES),
      },
      {
        path: 'cash-register',
        loadChildren: () =>
          import('@features/finance/treasury/cash-register/routing').then(
            (m) => m.CASH_REGISTER_ROUTES,
          ),
      },
      {
        path: 'receivables',
        loadChildren: () =>
          import('@features/finance/treasury/receivables/routing').then(
            (m) => m.RECEIVABLES_ROUTES,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
