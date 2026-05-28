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
          import('../pages/credit-note-list-page/credit-note-list-page.component').then(
            (m) => m.CreditNoteListPageComponent,
          ),
        title: 'Credit Notes',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('../pages/credit-note-form-page/credit-note-form-page.component').then(
            (m) => m.CreditNoteFormPageComponent,
          ),
        title: 'New Credit Note',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('../pages/credit-note-detail-page/credit-note-detail-page.component').then(
            (m) => m.CreditNoteDetailPageComponent,
          ),
        title: 'Credit Note Detail',
      },
    ],
  },
];
