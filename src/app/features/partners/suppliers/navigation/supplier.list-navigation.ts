import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import {
  ListNavigationDefinition,
  recordActions,
  history,
  listAction,
} from '@core/layouts/config/list-navigation.types';

export const SUPPLIER_LIST_NAVIGATION: ListNavigationDefinition = {
  route: '/partners/suppliers',
  singular: 'proveedor',
  create: true,
  actions: [
    ...recordActions(),
    listAction('Ver saldo', 'READ', 'wallet', BusinessModule.FINANCE_PAYABLES),
    history(),
  ],
};
