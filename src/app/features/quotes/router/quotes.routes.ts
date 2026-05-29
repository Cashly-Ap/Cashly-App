import { Routes } from '@angular/router';
import { authGuard, modulePermissionGuard } from '@features/auth/guards';
import { BusinessModule } from '@features/users/models/enums';

export const QUOTE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.SALES },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../pages/quote-list-page/quote-list-page.component').then(
            (m) => m.QuoteListPageComponent,
          ),
        title: 'Presupuestos',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('../pages/quote-form-page/quote-form-page.component').then(
            (m) => m.QuoteFormPageComponent,
          ),
        title: 'Nuevo Presupuesto',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../pages/quote-detail-page/quote-detail-page.component').then(
            (m) => m.QuoteDetailPageComponent,
          ),
        title: 'Detalle del Presupuesto',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('../pages/quote-form-page/quote-form-page.component').then(
            (m) => m.QuoteFormPageComponent,
          ),
        title: 'Editar Presupuesto',
      },
    ],
  },
];
