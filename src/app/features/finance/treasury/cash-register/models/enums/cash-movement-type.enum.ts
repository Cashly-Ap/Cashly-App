export enum CashMovementType {
  PAYMENT = 'PAYMENT',
  ADVANCE = 'ADVANCE',
  REFUND = 'REFUND',
  INVOICE = 'INVOICE',
  CREDIT_NOTE = 'CREDIT_NOTE',
  DEBIT_NOTE = 'DEBIT_NOTE',
  RETURN = 'RETURN',
  MANUAL_INCOME = 'MANUAL_INCOME',
  EXPENSE = 'EXPENSE',
  WITHDRAWAL = 'WITHDRAWAL',
  ADJUSTMENT = 'ADJUSTMENT',
}

export const CASH_MOVEMENT_TYPE_LABELS: Record<CashMovementType, string> = {
  [CashMovementType.PAYMENT]: 'Pago',
  [CashMovementType.ADVANCE]: 'Anticipo',
  [CashMovementType.REFUND]: 'Reembolso',
  [CashMovementType.INVOICE]: 'Factura',
  [CashMovementType.CREDIT_NOTE]: 'Nota de crédito',
  [CashMovementType.DEBIT_NOTE]: 'Nota de débito',
  [CashMovementType.RETURN]: 'Devolución',
  [CashMovementType.MANUAL_INCOME]: 'Ingreso manual',
  [CashMovementType.EXPENSE]: 'Gasto',
  [CashMovementType.WITHDRAWAL]: 'Retiro',
  [CashMovementType.ADJUSTMENT]: 'Ajuste',
};

export function getCashMovementTypeLabel(type: string): string {
  return CASH_MOVEMENT_TYPE_LABELS[type as CashMovementType] ?? type;
}
