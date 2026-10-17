export type ReferenceType = 'ORDER' | 'INVOICE' | 'RETURN' | 'TRANSFER' | 'MANUAL';

export const REFERENCE_TYPE_LABELS: Record<ReferenceType, string> = {
  ORDER: 'Pedido',
  INVOICE: 'Factura',
  RETURN: 'Devolución',
  TRANSFER: 'Transferencia',
  MANUAL: 'Manual',
};
