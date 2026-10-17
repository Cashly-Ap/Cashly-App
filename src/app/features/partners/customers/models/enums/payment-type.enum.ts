export enum PaymentType {
  CASH = 'CASH',
  CREDIT = 'CREDIT',
}

export interface PaymentTypeOption {
  label: string;
  value: PaymentType;
}

export const PAYMENT_TYPES: readonly PaymentTypeOption[] = [
  { label: 'Contado', value: PaymentType.CASH },
  { label: 'Crédito', value: PaymentType.CREDIT },
] as const;
