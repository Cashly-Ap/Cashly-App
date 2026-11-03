import {
  ListNavigationDefinition,
  recordActions,
} from '@core/layouts/config/list-navigation.types';

export const PRICE_TYPE_LIST_NAVIGATION: ListNavigationDefinition = {
  route: '/catalog/price-types',
  singular: 'tipo de precio',
  create: true,
  actions: recordActions(),
};
