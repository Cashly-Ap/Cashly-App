import { Routes } from '@angular/router';
import { authGuard } from '@features/auth/guards/auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('@features/auth/pages').then((m) => m.LoginPageComponent),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];

export const AUTHENTICATED_AUTH_ROUTES: Routes = [
  {
    path: 'configuration',
    loadComponent: () =>
      import('@features/auth/pages').then((m) => m.ConfigurationPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'change-password',
    loadComponent: () =>
      import('@features/auth/pages').then((m) => m.ChangePasswordPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'change-username',
    loadComponent: () =>
      import('@features/auth/pages').then((m) => m.ChangeUsernamePageComponent),
    canActivate: [authGuard],
  },
];
