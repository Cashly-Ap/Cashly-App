import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import {
  ListNavigationDefinition,
  edit,
  listAction,
  pdf,
  remove,
  view,
} from '@core/layouts/config/list-navigation.types';

export const INVOICE_LIST_NAVIGATION: ListNavigationDefinition = {
  route: '/finance/billing/invoices',
  singular: 'factura',
  create: true,
  actions: [
    view(),
    pdf(),
    listAction('Confirmar', 'CONFIRM', 'check', BusinessModule.FINANCE_INVOICES),
    edit(),
    listAction('Cancelar', 'CANCEL', 'times', BusinessModule.FINANCE_INVOICES),
    listAction('Duplicar', 'INVOICE_DUPLICATE', 'copy', BusinessModule.FINANCE_INVOICES),
    remove(),
  ],
};
