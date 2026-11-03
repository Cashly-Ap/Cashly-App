import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import {
  ListNavigationDefinition,
  listAction,
} from '@core/layouts/config/list-navigation.types';

export const CASH_REGISTER_LIST_NAVIGATION: ListNavigationDefinition = {
  route: '/finance/treasury/cash-register',
  singular: 'caja',
  actions: [
    listAction('Abrir caja', 'OPEN', 'lock-open', BusinessModule.FINANCE_CASH_REGISTER),
    listAction('Cerrar caja', 'CLOSE', 'lock', BusinessModule.FINANCE_CASH_REGISTER),
    listAction('Ver detalles', 'DETAILS', 'eye', BusinessModule.FINANCE_CASH_REGISTER),
  ],
};
