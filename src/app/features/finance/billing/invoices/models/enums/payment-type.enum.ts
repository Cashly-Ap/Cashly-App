export enum PaymentType {
  CASH = 'CASH',
  CREDIT = 'CREDIT',
}

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  [PaymentType.CASH]: 'Contado',
  [PaymentType.CREDIT]: 'Crédito',
};

export function getPaymentTypeLabel(paymentType: PaymentType): string {
  return PAYMENT_TYPE_LABELS[paymentType] ?? paymentType;
}
