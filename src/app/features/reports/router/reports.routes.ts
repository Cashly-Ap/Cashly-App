import { Routes } from '@angular/router';

export const REPORTS_ROUTES: Routes = [
  {
    path: 'inventory',
    loadChildren: () =>
      import('@features/reports/inventory/router').then(
        (m) => m.INVENTORY_REPORTS_ROUTES,
      ),
  },
];
