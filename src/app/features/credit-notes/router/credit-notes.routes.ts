import { Routes } from '@angular/router';
import { authGuard, modulePermissionGuard } from '@features/auth/guards';
import { BusinessModule } from '@features/users/models/enums';

export const CREDIT_NOTE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.FINANCE },
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '@features/credit-notes/pages/credit-note-list-page/credit-note-list-page.component'
          ).then((m) => m.CreditNoteListPageComponent),
        title: 'Notas de Crédito',
      },
      {
        path: 'new',
        loadComponent: () =>
          import(
            '@features/credit-notes/pages/credit-note-form-page/credit-note-form-page.component'
          ).then((m) => m.CreditNoteFormPageComponent),
        title: 'Nueva Nota de Crédito',
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            '@features/credit-notes/pages/credit-note-detail-page/credit-note-detail-page.component'
          ).then((m) => m.CreditNoteDetailPageComponent),
        title: 'Detalle de Nota de Crédito',
      },
    ],
  },
];
