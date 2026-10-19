import { Routes } from '@angular/router';
import { authGuard } from '../../guards/auth.guard';
import { modulePermissionGuard } from '../../guards/module-permission.guard';
import { BusinessModule } from '../../user/models/enums/business-module.enum';

const page = () =>
  import('../pages/departments-page.component').then((m) => m.DepartmentsPageComponent);

export const DEPARTMENTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    canActivateChild: [modulePermissionGuard],
    data: { module: BusinessModule.DEPARTMENTS },
    children: [
      {
        path: '',
        loadComponent: page,
        title: 'Departamentos',
        data: { view: 'list', action: 'READ' },
      },
      {
        path: 'new',
        loadComponent: page,
        title: 'Nuevo Departamento',
        data: { view: 'form', action: 'CREATE' },
      },
      {
        path: ':id',
        loadComponent: page,
        title: 'Detalles del Departamento',
        data: { view: 'detail', action: 'READ' },
      },
      {
        path: ':id/edit',
        loadComponent: page,
        title: 'Editar Departamento',
        data: { view: 'form', action: 'UPDATE' },
      },
    ],
  },
];
