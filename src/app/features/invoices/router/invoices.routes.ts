import { Routes } from '@angular/router';
import { authGuard, modulePermissionGuard } from '@features/auth/guards';
import { BusinessModule } from '@features/users/models/enums';

export const INVOICE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.SALES },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/invoices/pages/invoice-list-page/invoice-list-page.component').then(
            (m) => m.InvoiceListPageComponent,
          ),
        title: 'Facturas',
      },
      {
        path: 'new',
        loadComponent: () =>
          import('@features/invoices/pages/invoice-form-page/invoice-form-page.component').then(
            (m) => m.InvoiceFormPageComponent,
          ),
        title: 'Nueva Factura',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('@features/invoices/pages/invoice-form-page/invoice-form-page.component').then(
            (m) => m.InvoiceFormPageComponent,
          ),
        title: 'Editar Factura',
      },
      {
        path: ':id',
        loadComponent: () =>
          import('@features/invoices/pages/invoice-detail-page/invoice-detail-page.component').then(
            (m) => m.InvoiceDetailPageComponent,
          ),
        title: 'Detalle de Factura',
      },
    ],
  },
];
