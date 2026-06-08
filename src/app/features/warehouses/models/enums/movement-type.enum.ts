export type MovementType =
  | 'ENTRY'
  | 'EXIT'
  | 'ADJUSTMENT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'COMPONENT_EXIT'
  | 'RETURN_ENTRY'
  | 'CANCEL_ENTRY'
  | 'SALE_EXIT';

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  ENTRY: 'Entrada',
  EXIT: 'Salida',
  ADJUSTMENT: 'Ajuste',
  TRANSFER_IN: 'Transferencia entrada',
  TRANSFER_OUT: 'Transferencia salida',
  COMPONENT_EXIT: 'Salida por componente',
  RETURN_ENTRY: 'Entrada por devolución',
  CANCEL_ENTRY: 'Entrada por cancelación',
  SALE_EXIT: 'Salida por venta',
};
