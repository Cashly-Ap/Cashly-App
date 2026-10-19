import { Routes } from '@angular/router';
import { authGuard } from '@features/platform/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/platform/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export const CREDIT_NOTE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.FINANCE },
    canActivateChild: [modulePermissionGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '@features/finance/billing/credit-notes/pages/credit-note-list-page/credit-note-list-page.component'
          ).then((m) => m.CreditNoteListPageComponent),
        title: 'Notas de Crédito',
      },
      {
        path: 'new',
        loadComponent: () =>
          import(
            '@features/finance/billing/credit-notes/pages/credit-note-form-page/credit-note-form-page.component'
          ).then((m) => m.CreditNoteFormPageComponent),
        title: 'Nueva Nota de Crédito',
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            '@features/finance/billing/credit-notes/pages/credit-note-detail-page/credit-note-detail-page.component'
          ).then((m) => m.CreditNoteDetailPageComponent),
        title: 'Detalle de Nota de Crédito',
      },
    ],
  },
];
