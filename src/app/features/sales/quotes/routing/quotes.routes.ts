import { Routes } from '@angular/router';
import { authGuard } from '@features/platform/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/platform/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export const QUOTE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.SALES },
    canActivateChild: [modulePermissionGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/sales/quotes/pages/quote-list-page/quote-list-page.component').then(
            (m) => m.QuoteListPageComponent,
          ),
        title: 'Presupuestos',
      },
      {
        path: 'new',
        data: { requiredPermissions: ['INVENTORY:READ'] },
        loadComponent: () =>
          import('@features/sales/quotes/pages/quote-form-page/quote-form-page.component').then(
            (m) => m.QuoteFormPageComponent,
          ),
        title: 'Nuevo Presupuesto',
      },
      {
        path: ':id',
        data: { requiredPermissions: ['INVENTORY:READ'] },
        loadComponent: () =>
          import('@features/sales/quotes/pages/quote-detail-page/quote-detail-page.component').then(
            (m) => m.QuoteDetailPageComponent,
          ),
        title: 'Detalle del Presupuesto',
      },
      {
        path: ':id/edit',
        data: { requiredPermissions: ['INVENTORY:READ'] },
        loadComponent: () =>
          import('@features/sales/quotes/pages/quote-form-page/quote-form-page.component').then(
            (m) => m.QuoteFormPageComponent,
          ),
        title: 'Editar Presupuesto',
      },
    ],
  },
];
