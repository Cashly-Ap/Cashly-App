import { Routes } from '@angular/router';
import { authGuard, homeRedirectGuard } from '@features/auth/guards';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [homeRedirectGuard],
    loadComponent: () => import('@features/auth/pages/login/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'auth',
    loadChildren: () => import('@features/auth/router').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '**',
    canActivate: [homeRedirectGuard],
    loadComponent: () => import('@features/auth/pages/login/login-page.component').then((m) => m.LoginPageComponent),
  },
];
