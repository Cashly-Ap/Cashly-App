import { Routes } from '@angular/router';
import { authGuard } from '@features/platform/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/platform/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export const RETURN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.SALES_INVOICES_RETURNS },
    canActivateChild: [modulePermissionGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '@features/sales/invoices/returns/pages/return-list-page/return-list-page.component'
          ).then((m) => m.ReturnListPageComponent),
        title: 'Devoluciones',
      },
      {
        path: 'new',
        data: { requiredPermissions: ['SALES_INVOICES_RETURNS:CREATE'] },
        loadComponent: () =>
          import(
            '@features/sales/invoices/returns/pages/return-form-page/return-form-page.component'
          ).then((m) => m.ReturnFormPageComponent),
        title: 'Nueva Devolución',
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            '@features/sales/invoices/returns/pages/return-detail-page/return-detail-page.component'
          ).then((m) => m.ReturnDetailPageComponent),
        title: 'Detalle de Devolución',
      },
    ],
  },
];
