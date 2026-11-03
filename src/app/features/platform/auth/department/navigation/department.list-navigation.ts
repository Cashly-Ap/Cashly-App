import {
  ListNavigationDefinition,
  recordActions,
} from '@core/layouts/config/list-navigation.types';

export const DEPARTMENT_LIST_NAVIGATION: ListNavigationDefinition = {
  route: '/platform/departments',
  singular: 'departamento',
  create: true,
  actions: recordActions(),
};
