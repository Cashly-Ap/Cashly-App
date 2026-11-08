import {
  ListNavigationDefinition,
  history,
  remove,
  view,
} from '@core/layouts/config/list-navigation.types';

export const DEBIT_NOTE_LIST_NAVIGATION: ListNavigationDefinition = {
  route: '/finance/billing/debit-notes',
  singular: 'nota de débito',
  create: true,
  actions: [view(), remove(), history()],
};
