import { StatusVariant } from '@shared/models/status-variant';
import { OrderStatus } from '@features/sales/orders/models/enums/order-status.enum';

export function orderStatusVariant(status: OrderStatus): StatusVariant {
  const variants: Record<OrderStatus, StatusVariant> = {
    [OrderStatus.DRAFT]: 'label',
    [OrderStatus.CONFIRMED]: 'info',
    [OrderStatus.CANCELLED]: 'danger',
    [OrderStatus.INVOICED]: 'success',
  };
  return variants[status] ?? 'label';
}
