import { Routes } from '@angular/router';
import { authGuard } from '@features/platform/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/platform/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export const EXPENSES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.FINANCE_CASH_REGISTER },
    canActivateChild: [modulePermissionGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '@features/finance/treasury/expenses/pages/expenses-list-page/expenses-list-page.component'
          ).then((m) => m.ExpensesListPageComponent),
        title: 'Gastos',
      },
      {
        path: 'new',
        loadComponent: () =>
          import(
            '@features/finance/treasury/expenses/pages/expenses-form-page/expenses-form-page.component'
          ).then((m) => m.ExpensesFormPageComponent),
        title: 'Nuevo Gasto',
      },
      {
        path: ':id',
        loadComponent: () =>
          import(
            '@features/finance/treasury/expenses/pages/expenses-details-page/expenses-details-page.component'
          ).then((m) => m.ExpensesDetailsPageComponent),
        title: 'Detalle de Gasto',
      },
    ],
  },
];
