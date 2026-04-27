export type MovementType = 'ENTRY' | 'EXIT' | 'ADJUSTMENT' | 'TRANSFER';

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  ENTRY: 'Entrada',
  EXIT: 'Salida',
  ADJUSTMENT: 'Ajuste',
  TRANSFER: 'Transferencia',
};
