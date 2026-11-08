import {
  ListNavigationDefinition,
  recordActions,
  history,
} from '@core/layouts/config/list-navigation.types';

export const PAYMENT_METHOD_LIST_NAVIGATION: ListNavigationDefinition = {
  route: '/finance/treasury/payment-methods',
  singular: 'método de pago',
  create: true,
  actions: [...recordActions(), history()],
};
