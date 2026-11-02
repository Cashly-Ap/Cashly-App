import { Routes } from '@angular/router';
import { authGuard } from '@features/platform/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/platform/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export const SUPPLIER_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.CONTACTS_SUPPLIERS },
    canActivateChild: [modulePermissionGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '@features/partners/suppliers/pages/suppliers-list-page/suppliers-list-page.component'
          ).then((m) => m.SuppliersListPageComponent),
        title: 'Proveedores',
      },
      {
        path: 'new',
        loadComponent: () =>
          import(
            '@features/partners/suppliers/pages/suppliers-form-page/suppliers-form-page.component'
          ).then((m) => m.SuppliersFormPageComponent),
        title: 'Nuevo Proveedor',
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            '@features/partners/suppliers/pages/suppliers-details-page/suppliers-details-page.component'
          ).then((m) => m.SuppliersDetailsPageComponent),
        title: 'Detalles del Proveedor',
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import(
            '@features/partners/suppliers/pages/suppliers-form-page/suppliers-form-page.component'
          ).then((m) => m.SuppliersFormPageComponent),
        title: 'Editar Proveedor',
      },
    ],
  },
];
