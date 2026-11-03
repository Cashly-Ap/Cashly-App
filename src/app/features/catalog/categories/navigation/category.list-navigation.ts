import {
  ListNavigationDefinition,
  recordActions,
} from '@core/layouts/config/list-navigation.types';

export const CATEGORY_LIST_NAVIGATION: ListNavigationDefinition = {
  route: '/catalog/categories',
  singular: 'categoría',
  create: true,
  actions: recordActions(),
};
