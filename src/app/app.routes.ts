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
    path: 'products',
    loadChildren: () => import('@features/products/router').then((m) => m.PRODUCT_ROUTES),
  },
  {
    path: 'warehouses',
    loadChildren: () => import('@features/warehouses/router').then((m) => m.WAREHOUSE_ROUTES),
  },
  {
    path: 'reports',
    loadChildren: () => import('@features/reports/router').then((m) => m.REPORTS_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
