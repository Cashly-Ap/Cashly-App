import { PaymentMethodList, PaymentMethodDetail } from '../../models/interfaces';

export class FinanceMapper {
  static toPaymentMethodList(detail: PaymentMethodDetail): PaymentMethodList {
    return {
      id: detail.id,
      code: detail.code,
      name: detail.name,
      description: detail.description,
      isActive: detail.isActive,
      createdAt: detail.createdAt,
    };
  }

  static formatCreatedAt(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
