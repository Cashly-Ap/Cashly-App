export enum OrderStatus {
  DRAFT = 'DRAFT',
  CUSTOMER_DRAFT = 'CUSTOMER_DRAFT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  INVOICED = 'INVOICED',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.DRAFT]: 'Borrador',
  [OrderStatus.CUSTOMER_DRAFT]: 'Borrador de Cliente',
  [OrderStatus.CONFIRMED]: 'Confirmado',
  [OrderStatus.CANCELLED]: 'Cancelado',
  [OrderStatus.INVOICED]: 'Facturado',
};

export function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}
