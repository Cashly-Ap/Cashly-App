import {
  ListNavigationDefinition,
  recordActions,
} from '@core/layouts/config/list-navigation.types';

export const SUPPLIER_LIST_NAVIGATION: ListNavigationDefinition = {
  route: '/partners/suppliers',
  singular: 'proveedor',
  create: true,
  actions: recordActions(),
};
