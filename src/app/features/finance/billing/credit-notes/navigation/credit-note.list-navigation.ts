import {
  ListNavigationDefinition,
  history,
  remove,
  view,
} from '@core/layouts/config/list-navigation.types';

export const CREDIT_NOTE_LIST_NAVIGATION: ListNavigationDefinition = {
  route: '/finance/billing/credit-notes',
  singular: 'nota de crédito',
  create: true,
  actions: [view(), remove(), history()],
};
