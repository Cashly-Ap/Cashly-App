import {
  ListNavigationDefinition,
  history,
  remove,
  view,
} from '@core/layouts/config/list-navigation.types';

export const RETURN_LIST_NAVIGATION: ListNavigationDefinition = {
  route: '/finance/billing/returns',
  singular: 'devolución',
  create: true,
  actions: [view(), remove(), history()],
};
