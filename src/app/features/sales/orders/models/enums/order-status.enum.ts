export enum OrderStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  INVOICED = 'INVOICED',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.DRAFT]: 'Borrador',
  [OrderStatus.CONFIRMED]: 'Confirmado',
  [OrderStatus.CANCELLED]: 'Cancelado',
  [OrderStatus.INVOICED]: 'Facturado',
};

export function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}
