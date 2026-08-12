import { Routes } from '@angular/router';

export const INVENTORY_REPORTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@features/reports/inventory/pages/inventory-reports-page.component'),
  },
];
