import { Routes } from '@angular/router';

import { authGuard } from '@features/platform/auth/guards/auth.guard';
import { modulePermissionGuard } from '@features/platform/auth/guards/module-permission.guard';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';

export const INVENTORY_REPORTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, modulePermissionGuard],
    data: { module: BusinessModule.INVENTORY },
    loadComponent: () =>
      import('@features/inventory/warehouses/reporting/pages/inventory-reports-page.component'),
  },
];
