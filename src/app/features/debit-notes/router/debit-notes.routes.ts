import { Routes } from '@angular/router';
import { authGuard, modulePermissionGuard } from '@features/auth/guards';
import { BusinessModule } from '@features/users/models/enums';

export const DEBIT_NOTE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.FINANCE },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../pages/debit-note-list-page/debit-note-list-page.component').then(
            (m) => m.DebitNoteListPageComponent,
          ),
        title: 'Debit Notes',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('../pages/debit-note-form-page/debit-note-form-page.component').then(
            (m) => m.DebitNoteFormPageComponent,
          ),
        title: 'New Debit Note',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../pages/debit-note-detail-page/debit-note-detail-page.component').then(
            (m) => m.DebitNoteDetailPageComponent,
          ),
        title: 'Debit Note Detail',
      },
    ],
  },
];
