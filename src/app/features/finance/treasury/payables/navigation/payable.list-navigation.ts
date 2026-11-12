import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { ListNavigationDefinition, listAction } from '@core/layouts/config/list-navigation.types';

export const PAYABLE_LIST_NAVIGATION: ListNavigationDefinition = {
  route: '/finance/treasury/payables',
  singular: 'proveedor',
  actions: [
    listAction('Ver deuda', 'DETAILS', 'eye', BusinessModule.FINANCE_PAYABLES),
    listAction('Pagar todo', 'PAY_ALL', 'check-circle', BusinessModule.FINANCE_PAYABLES),
    listAction('Pago parcial', 'PARTIAL_PAYMENT', 'percentage', BusinessModule.FINANCE_PAYABLES),
    listAction(
      'Pagar con validación',
      'PAY_WITH_VALIDATION',
      'shield',
      BusinessModule.FINANCE_PAYABLES,
    ),
    listAction('Reintegro', 'REFUND', 'undo', BusinessModule.FINANCE_PAYABLES),
    listAction('Generar anticipo', 'ADVANCE', 'plus-circle', BusinessModule.FINANCE_PAYABLES),
    ...['Aprobar pago', 'Rechazar pago'].map((label) => ({
      ...listAction(
        label,
        label === 'Aprobar pago' ? 'APPROVE_PAYMENT' : 'REJECT_PAYMENT',
        label === 'Aprobar pago' ? 'check' : 'times',
        BusinessModule.FINANCE_PAYABLES,
      ),
      queryParams: { tab: 'pending' },
    })),
    listAction('Editar cuenta por pagar', 'UPDATE', 'pencil', BusinessModule.FINANCE_PAYABLES),
    listAction('Eliminar cuenta por pagar', 'DELETE', 'trash', BusinessModule.FINANCE_PAYABLES),
  ],
};
