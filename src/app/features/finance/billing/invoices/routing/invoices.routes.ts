import { Routes } from '@angular/router';
import { authGuard } from '@features/platform/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/platform/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export const INVOICE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.SALES },
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '@features/finance/billing/invoices/pages/invoice-list-page/invoice-list-page.component'
          ).then((m) => m.InvoiceListPageComponent),
        title: 'Facturas',
      },
      {
        path: 'new',
        loadComponent: () =>
          import(
            '@features/finance/billing/invoices/pages/invoice-form-page/invoice-form-page.component'
          ).then((m) => m.InvoiceFormPageComponent),
        title: 'Nueva Factura',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import(
            '@features/finance/billing/invoices/pages/invoice-form-page/invoice-form-page.component'
          ).then((m) => m.InvoiceFormPageComponent),
        title: 'Editar Factura',
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            '@features/finance/billing/invoices/pages/invoice-detail-page/invoice-detail-page.component'
          ).then((m) => m.InvoiceDetailPageComponent),
        title: 'Detalle de Factura',
      },
    ],
  },
];
