import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import {
  ListNavigationDefinition,
  history,
  listAction,
} from '@core/layouts/config/list-navigation.types';

export const EXPENSE_LIST_NAVIGATION: ListNavigationDefinition = {
  route: '/finance/treasury/expenses',
  singular: 'gasto',
  actions: [
    listAction('Ver detalle', 'EXECUTE', 'eye', BusinessModule.FINANCE_CASH_REGISTER),
    listAction('Eliminar gasto', 'EXECUTE', 'trash', BusinessModule.FINANCE_CASH_REGISTER),
    history(),
  ],
  destinations: [
    {
      label: 'Nuevo gasto',
      icon: 'pi pi-plus',
      routerLink: '/finance/treasury/expenses/new',
      requiredAction: 'EXECUTE',
      requiredModule: BusinessModule.FINANCE_CASH_REGISTER,
    },
  ],
};
