import {
  ListNavigationDefinition,
  recordActions,
  history,
} from '@core/layouts/config/list-navigation.types';

export const USER_LIST_NAVIGATION: ListNavigationDefinition = {
  route: '/platform/users',
  singular: 'usuario',
  create: true,
  actions: [...recordActions(), history()],
};
