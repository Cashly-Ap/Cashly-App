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

export const INVOICE_LIST_NAVIGATION: ListNavigationDefinition = {
  route: '/sales/invoices',
  singular: 'factura',
  create: true,
  actions: [
    view(),
    pdf(),
    listAction('Confirmar', 'CONFIRM', 'check', BusinessModule.SALES_INVOICES_INVOICES),
    edit(),
    listAction('Cancelar', 'CANCEL', 'times', BusinessModule.SALES_INVOICES_INVOICES),
    listAction('Duplicar', 'INVOICE_DUPLICATE', 'copy', BusinessModule.SALES_INVOICES_INVOICES),
    remove(),
    history(),
  ],
};
