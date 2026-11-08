import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import {
  ListNavigationDefinition,
  edit,
  listAction,
  pdf,
  remove,
  view,
  history,
} from '@core/layouts/config/list-navigation.types';

export const ORDER_LIST_NAVIGATION: ListNavigationDefinition = {
  route: '/sales/orders',
  singular: 'pedido',
  create: true,
  actions: [
    view(),
    pdf(),
    edit(),
    listAction('Confirmar', 'CONFIRM', 'check', BusinessModule.FINANCE_INVOICES),
    listAction('Convertir a factura', 'CREATE', 'file', BusinessModule.FINANCE_INVOICES),
    listAction('Cancelar', 'CANCEL', 'times', BusinessModule.FINANCE_INVOICES),
    remove(),
    history(),
  ],
};
