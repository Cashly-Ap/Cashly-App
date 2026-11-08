import {
  ListNavigationDefinition,
  recordActions,
  history,
} from '@core/layouts/config/list-navigation.types';

export const PRODUCT_LIST_NAVIGATION: ListNavigationDefinition = {
  route: '/catalog/products',
  singular: 'producto',
  create: true,
  actions: [...recordActions(), history()],
};
