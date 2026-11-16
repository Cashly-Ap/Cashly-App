import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import {
  ListNavigationDefinition,
  edit,
  listAction,
  remove,
  view,
  history,
} from '@core/layouts/config/list-navigation.types';

export const CUSTOMER_LIST_NAVIGATION: ListNavigationDefinition = {
  route: '/partners/customers',
  singular: 'cliente',
  create: true,
  actions: [
    view(),
    edit(),
    listAction('Ver saldo', 'CUSTOMER_BALANCE', 'wallet', BusinessModule.CONTACTS_CUSTOMERS),
    remove(),
    history(),
  ],
};
