import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import {
  ListNavigationDefinition,
  listAction,
} from '@core/layouts/config/list-navigation.types';

export const RECEIVABLE_LIST_NAVIGATION: ListNavigationDefinition = {
  route: '/finance/treasury/receivables',
  singular: 'cliente',
  actions: [
    listAction('Ver deuda', 'DETAILS', 'eye', BusinessModule.FINANCE_RECEIVABLES),
    listAction('Pagar todo', 'PAY_ALL', 'check-circle', BusinessModule.FINANCE_RECEIVABLES),
    listAction('Pago parcial', 'PARTIAL_PAYMENT', 'percentage', BusinessModule.FINANCE_RECEIVABLES),
    listAction('Pagar directamente', 'PAY_DIRECT', 'credit-card', BusinessModule.FINANCE_RECEIVABLES),
    listAction(
      'Pagar con validación',
      'PAY_WITH_VALIDATION',
      'shield',
      BusinessModule.FINANCE_RECEIVABLES,
    ),
    listAction('Reintegro', 'REFUND', 'undo', BusinessModule.FINANCE_RECEIVABLES),
    listAction('Generar anticipo', 'ADVANCE', 'plus-circle', BusinessModule.FINANCE_RECEIVABLES),
    ...['Aprobar pago', 'Rechazar pago'].map((label) => ({
      ...listAction(
        label,
        label === 'Aprobar pago' ? 'APPROVE_PAYMENT' : 'REJECT_PAYMENT',
        label === 'Aprobar pago' ? 'check' : 'times',
        BusinessModule.FINANCE_RECEIVABLES,
      ),
      queryParams: { tab: 'pending' },
    })),
    listAction('Editar cuenta por cobrar', 'UPDATE', 'pencil', BusinessModule.FINANCE_RECEIVABLES),
    listAction('Eliminar cuenta por cobrar', 'DELETE', 'trash', BusinessModule.FINANCE_RECEIVABLES),
  ],
};
