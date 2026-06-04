export enum PaymentType {
  PAYMENT = 'PAYMENT',
}

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  [PaymentType.PAYMENT]: 'Pago',
};

export function getPaymentTypeLabel(type: PaymentType): string {
  return PAYMENT_TYPE_LABELS[type] ?? type;
}
