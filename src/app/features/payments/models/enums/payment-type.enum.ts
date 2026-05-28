export enum PaymentType {
  PAYMENT = 'PAYMENT',
  ADVANCE = 'ADVANCE',
}

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  [PaymentType.PAYMENT]: 'Pago',
  [PaymentType.ADVANCE]: 'Anticipo',
};

export function getPaymentTypeLabel(type: PaymentType): string {
  return PAYMENT_TYPE_LABELS[type] ?? type;
}
