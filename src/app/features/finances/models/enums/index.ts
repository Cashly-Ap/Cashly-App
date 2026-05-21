export * from './payment-type.enum';
export * from './payment-status.enum';
export * from './return-type.enum';
export * from './return-status.enum';

export enum PaymentMethodType {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  MOBILE_PAYMENT = 'MOBILE_PAYMENT',
  CRYPTO = 'CRYPTO',
  OTHER = 'OTHER',
}

export const PAYMENT_METHOD_TYPE_LABELS: Record<PaymentMethodType, string> = {
  [PaymentMethodType.CASH]: 'Efectivo',
  [PaymentMethodType.CREDIT_CARD]: 'Tarjeta de Crédito',
  [PaymentMethodType.DEBIT_CARD]: 'Tarjeta de Débito',
  [PaymentMethodType.BANK_TRANSFER]: 'Transferencia Bancaria',
  [PaymentMethodType.CHECK]: 'Cheque',
  [PaymentMethodType.MOBILE_PAYMENT]: 'Pago Móvil',
  [PaymentMethodType.CRYPTO]: 'Criptomoneda',
  [PaymentMethodType.OTHER]: 'Otro',
};
