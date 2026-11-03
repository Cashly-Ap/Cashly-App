import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import {
  ListNavigationDefinition,
  edit,
  listAction,
  pdf,
  remove,
  view,
} from '@core/layouts/config/list-navigation.types';

export const QUOTE_LIST_NAVIGATION: ListNavigationDefinition = {
  route: '/sales/quotes',
  singular: 'presupuesto',
  create: true,
  actions: [
    view(),
    pdf(),
    edit(),
    listAction('Convertir a pedido', 'CREATE', 'shopping-cart', BusinessModule.SALES_ORDERS),
    listAction('Convertir a factura', 'CREATE', 'file', BusinessModule.FINANCE_INVOICES),
    listAction('Cancelar', 'CANCEL', 'times'),
    remove(),
  ],
};
