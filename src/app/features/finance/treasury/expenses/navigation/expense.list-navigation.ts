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
    listAction('Ver detalle', 'READ', 'eye', BusinessModule.FINANCE_EXPENSES),
    listAction('Cancelar', 'READ', 'times-circle', BusinessModule.FINANCE_EXPENSES),
    listAction('Eliminar gasto', 'READ', 'trash', BusinessModule.FINANCE_EXPENSES),
    history(),
  ],
  destinations: [
    {
      label: 'Nuevo gasto',
      icon: 'pi pi-plus',
      routerLink: '/finance/treasury/expenses/new',
      requiredAction: 'READ',
      requiredModule: BusinessModule.FINANCE_EXPENSES,
    },
  ],
};
