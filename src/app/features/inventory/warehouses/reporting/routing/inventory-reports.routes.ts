import { Routes } from '@angular/router';

export const INVENTORY_REPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@features/inventory/warehouses/reporting/pages/inventory-reports-page.component'),
  },
];
