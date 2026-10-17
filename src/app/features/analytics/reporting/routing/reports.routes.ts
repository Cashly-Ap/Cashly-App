import { Routes } from '@angular/router';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'inventory',
    pathMatch: 'full',
  },
  {
    path: 'inventory',
    loadChildren: () =>
      import('@features/inventory/warehouses/reporting/routing').then(
        (m) => m.INVENTORY_REPORTS_ROUTES,
      ),
  },
];
