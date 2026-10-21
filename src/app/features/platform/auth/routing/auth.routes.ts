import { Routes } from '@angular/router';
import { authGuard } from '@features/platform/auth/guards/auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('@features/platform/auth/pages').then((m) => m.LoginPageComponent),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];

export const AUTHENTICATED_AUTH_ROUTES: Routes = [
  {
    path: 'security',
    loadComponent: () =>
      import('../pages/security/security-page.component').then((m) => m.SecurityPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'configuration',
    loadComponent: () =>
      import('@features/platform/auth/pages').then((m) => m.ConfigurationPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'change-password',
    loadComponent: () =>
      import('@features/platform/auth/pages').then((m) => m.ChangePasswordPageComponent),
    canActivate: [authGuard],
  },
  {
    path: 'change-username',
    loadComponent: () =>
      import('@features/platform/auth/pages').then((m) => m.ChangeUsernamePageComponent),
    canActivate: [authGuard],
  },
];
