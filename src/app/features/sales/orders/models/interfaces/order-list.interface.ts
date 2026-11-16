import { OrderStatus } from '@features/sales/orders/models/enums/order-status.enum';

export interface OrderList {
  id: string;
  orderNumber: string;
  customerAlias: string;
  customerId: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
}
