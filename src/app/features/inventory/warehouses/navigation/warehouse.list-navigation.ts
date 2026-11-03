import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import {
  ListNavigationDefinition,
  destination,
  listAction,
  recordActions,
} from '@core/layouts/config/list-navigation.types';

export const WAREHOUSE_LIST_NAVIGATION: ListNavigationDefinition = {
  route: '/inventory/warehouses',
  singular: 'almacén',
  create: true,
  destinations: [
    destination(
      'Ver stock',
      '/inventory/warehouses/stock',
      'READ',
      'box',
      BusinessModule.INVENTORY_WAREHOUSES,
    ),
    destination(
      'Historial de movimientos',
      '/inventory/warehouses/movements',
      'READ',
      'history',
      BusinessModule.INVENTORY_WAREHOUSES,
    ),
  ],
  actions: [
    listAction('Registrar entrada', 'EXECUTE', 'arrow-circle-down', BusinessModule.INVENTORY_WAREHOUSES),
    listAction('Registrar salida', 'EXECUTE', 'arrow-circle-up', BusinessModule.INVENTORY_WAREHOUSES),
    ...recordActions(),
  ],
};
