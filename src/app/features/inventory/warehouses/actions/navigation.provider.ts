import { Provider } from '@angular/core';
import {
  NAVIGATION_ACTION_HANDLERS,
  NavigationActionHandlerRegistration,
  NavigationActionRecord,
} from '@shared/services/navigation-action-handlers.token';
import { WarehouseActionDialogService } from '@core/layouts/services/warehouse-action-dialog.service';

export function provideNavigationActionHandlers(): Provider[] {
  return [
    ['Registrar entrada', 'entry'],
    ['Registrar salida', 'exit'],
  ].map(([label, operation]) => ({
    provide: NAVIGATION_ACTION_HANDLERS,
    multi: true,
    useFactory: (service: WarehouseActionDialogService): NavigationActionHandlerRegistration => ({
      resource: 'warehouses',
      label,
      execute: (record: NavigationActionRecord) =>
        service.open({
          warehouseId: record.id,
          warehouseName: record.label,
          operation: operation as 'entry' | 'exit',
        }),
    }),
    deps: [WarehouseActionDialogService],
  }));
}
