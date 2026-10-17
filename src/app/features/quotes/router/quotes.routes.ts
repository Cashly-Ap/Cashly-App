import { Routes } from '@angular/router';
import { authGuard } from '@features/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/users/models/enums/business-module.enum';

export const QUOTE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.SALES },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/quotes/pages/quote-list-page/quote-list-page.component').then(
            (m) => m.QuoteListPageComponent,
          ),
        title: 'Presupuestos',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('@features/quotes/pages/quote-form-page/quote-form-page.component').then(
            (m) => m.QuoteFormPageComponent,
          ),
        title: 'Nuevo Presupuesto',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('@features/quotes/pages/quote-detail-page/quote-detail-page.component').then(
            (m) => m.QuoteDetailPageComponent,
          ),
        title: 'Detalle del Presupuesto',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('@features/quotes/pages/quote-form-page/quote-form-page.component').then(
            (m) => m.QuoteFormPageComponent,
          ),
        title: 'Editar Presupuesto',
      },
    ],
  },
];
