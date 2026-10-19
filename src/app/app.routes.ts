import { inject } from '@angular/core';
import { Router, Routes, UrlSegment } from '@angular/router';
import { authGuard } from '@features/platform/auth/guards/auth.guard';
import { homeRedirectGuard } from '@features/platform/auth/guards/home-redirect.guard';
import { modulePermissionGuard } from '@features/platform/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

function legacyRoute(source: string, destination: string): Routes[number] {
  return {
    matcher: (segments) => (segments[0]?.path === source ? { consumed: segments } : null),
    redirectTo: ({ url, queryParams, fragment }) => {
      const tree = inject(Router).createUrlTree(['/' + destination], {
        queryParams,
        fragment: fragment ?? undefined,
      });
      const segments = tree.root.children['primary'].segments;
      const last = segments.length - 1;
      segments[last] = new UrlSegment(segments[last].path, url[0]?.parameters ?? {});
      segments.push(
        ...url.slice(1).map((segment) => new UrlSegment(segment.path, segment.parameters)),
      );
      return tree;
    },
  };
}

function areaEntry(area: string): Routes[number] {
  return {
    path: '',
    pathMatch: 'full',
    data: { navigationArea: area },
    canActivate: [homeRedirectGuard],
    loadComponent: () =>
      import('@features/platform/auth/pages/login/login-page.component').then(
        (m) => m.LoginPageComponent,
      ),
  };
}

export const routes: Routes = [
  legacyRoute('quotes', 'sales/quotes'),
  legacyRoute('orders', 'sales/orders'),
  legacyRoute('purchases', 'procurement/purchases'),
  legacyRoute('products', 'catalog/products'),
  legacyRoute('categories', 'catalog/categories'),
  legacyRoute('price-types', 'catalog/price-types'),
  legacyRoute('warehouses', 'inventory/warehouses'),
  legacyRoute('invoices', 'finance/billing/invoices'),
  legacyRoute('returns', 'finance/billing/returns'),
  legacyRoute('credit-notes', 'finance/billing/credit-notes'),
  legacyRoute('debit-notes', 'finance/billing/debit-notes'),
  legacyRoute('cash-register', 'finance/treasury/cash-register'),
  legacyRoute('receivables', 'finance/treasury/receivables'),
  legacyRoute('payment-methods', 'finance/treasury/payment-methods'),
  legacyRoute('customers', 'partners/customers'),
  legacyRoute('suppliers', 'partners/suppliers'),
  legacyRoute('dashboard', 'analytics/dashboard'),
  legacyRoute('reports', 'analytics/reports'),
  legacyRoute('users', 'platform/users'),
  legacyRoute('auth', 'platform/auth'),
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
    path: 'platform/auth',
    loadChildren: () => import('@features/platform/auth/routing').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    loadComponent: () =>
      import('@core/layouts/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: 'platform',
        children: [
          areaEntry('platform'),
          {
            path: 'auth',
            loadChildren: () =>
              import('@features/platform/auth/routing').then((m) => m.AUTHENTICATED_AUTH_ROUTES),
          },
          {
            path: 'roles',
            loadChildren: () =>
              import('@features/platform/auth/role/routing/roles.routes').then(
                (m) => m.ROLES_ROUTES,
              ),
          },
          {
            path: 'departments',
            loadChildren: () =>
              import('@features/platform/auth/department/routing/departments.routes').then(
                (m) => m.DEPARTMENTS_ROUTES,
              ),
          },
          {
            path: 'users',
            loadChildren: () =>
              import('@features/platform/auth/user/routing').then((m) => m.USER_ROUTES),
          },
        ],
      },
      {
        path: 'analytics',
        children: [
          areaEntry('analytics'),
          {
            path: 'dashboard',
            canActivate: [authGuard, modulePermissionGuard],
            data: { module: BusinessModule.DASHBOARD },
            loadComponent: () =>
              import(
                '@features/analytics/dashboard/pages/dashboard-page/dashboard-page.component'
              ).then((m) => m.DashboardPageComponent),
          },
          {
            path: 'reports',
            canActivate: [authGuard, modulePermissionGuard],
            data: { module: BusinessModule.DOCUMENT_ADMIN },
            loadChildren: () =>
              import('@features/analytics/reporting/routing').then((m) => m.REPORTS_ROUTES),
          },
        ],
      },
      {
        path: 'partners',
        children: [
          areaEntry('partners'),
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
        ],
      },
      {
        path: 'procurement',
        children: [
          areaEntry('procurement'),
          {
            path: 'purchases',
            loadChildren: () =>
              import('@features/procurement/purchases/routing').then((m) => m.PURCHASE_ROUTES),
          },
        ],
      },
      {
        path: 'catalog',
        children: [
          areaEntry('catalog'),
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
        ],
      },
      {
        path: 'inventory',
        children: [
          areaEntry('inventory'),
          {
            path: 'warehouses',
            loadChildren: () =>
              import('@features/inventory/warehouses/routing').then((m) => m.WAREHOUSE_ROUTES),
          },
        ],
      },
      {
        path: 'sales',
        children: [
          areaEntry('sales'),
          {
            path: 'orders',
            loadChildren: () =>
              import('@features/sales/orders/routing').then((m) => m.ORDER_ROUTES),
          },
          {
            path: 'quotes',
            loadChildren: () =>
              import('@features/sales/quotes/routing').then((m) => m.QUOTE_ROUTES),
          },
        ],
      },
      {
        path: 'finance',
        children: [
          areaEntry('finance'),
          {
            path: 'billing',
            children: [
              areaEntry('finance/billing'),
              {
                path: 'invoices',
                loadChildren: () =>
                  import('@features/finance/billing/invoices/routing').then(
                    (m) => m.INVOICE_ROUTES,
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
                  import('@features/finance/billing/debit-notes/routing').then(
                    (m) => m.DEBIT_NOTE_ROUTES,
                  ),
              },
              {
                path: 'returns',
                loadChildren: () =>
                  import('@features/finance/billing/returns/routing').then((m) => m.RETURN_ROUTES),
              },
            ],
          },
          {
            path: 'treasury',
            children: [
              areaEntry('finance/treasury'),
              {
                path: 'payment-methods',
                loadChildren: () =>
                  import('@features/finance/treasury/payment-methods/routing').then(
                    (m) => m.PAYMENT_METHOD_ROUTES,
                  ),
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
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
