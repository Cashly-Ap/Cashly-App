import {
  ListNavigationDefinition,
  recordActions,
} from '@core/layouts/config/list-navigation.types';

export const ROLE_LIST_NAVIGATION: ListNavigationDefinition = {
  route: '/platform/roles',
  singular: 'rol',
  create: true,
  actions: recordActions(),
};
