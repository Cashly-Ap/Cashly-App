import {
  ListNavigationDefinition,
  edit,
  listAction,
  pdf,
  remove,
  view,
} from '@core/layouts/config/list-navigation.types';

export const PURCHASE_LIST_NAVIGATION: ListNavigationDefinition = {
  route: '/procurement/purchases',
  singular: 'compra',
  create: true,
  actions: [
    view(),
    pdf(),
    edit(),
    listAction('Confirmar compra', 'CONFIRM', 'check'),
    listAction('Cancelar compra', 'CANCEL', 'ban', undefined, ['INVENTORY_WAREHOUSES:RECORD_EXIT']),
    remove(),
  ],
};
