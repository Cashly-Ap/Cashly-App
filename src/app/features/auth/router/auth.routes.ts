import { Routes } from '@angular/router';
import { authGuard } from '@features/auth/guards';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('@features/auth/pages').then((m) => m.LoginPageComponent),
  },
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
  {
    path: 'change-commission-deduction',
    loadComponent: () =>
      import('@features/auth/pages').then((m) => m.ChangeCommissionDeductionPageComponent),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];

