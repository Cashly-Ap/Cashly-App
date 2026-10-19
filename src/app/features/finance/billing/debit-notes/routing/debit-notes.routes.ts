import { Routes } from '@angular/router';
import { authGuard } from '@features/platform/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/platform/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export const DEBIT_NOTE_ROUTES: Routes = [
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
            '@features/finance/billing/debit-notes/pages/debit-note-list-page/debit-note-list-page.component'
          ).then((m) => m.DebitNoteListPageComponent),
        title: 'Notas de Débito',
      },
      {
        path: 'new',
        loadComponent: () =>
          import(
            '@features/finance/billing/debit-notes/pages/debit-note-form-page/debit-note-form-page.component'
          ).then((m) => m.DebitNoteFormPageComponent),
        title: 'Nueva Nota de Débito',
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            '@features/finance/billing/debit-notes/pages/debit-note-detail-page/debit-note-detail-page.component'
          ).then((m) => m.DebitNoteDetailPageComponent),
        title: 'Detalle de Nota de Débito',
      },
    ],
  },
];
