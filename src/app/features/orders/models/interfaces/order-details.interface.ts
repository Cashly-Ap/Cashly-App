import { OrderStatus } from '@features/orders/models/enums/order-status.enum';

export interface OrderItemDetail {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderDetails {
  id: string;
  orderNumber: string;
  customerId: string;
  customerAlias: string;
  customerLegalName: string;
  status: OrderStatus;
  notes: string | null;
  totalAmount: number;
  items: OrderItemDetail[];
  createdAt: string;
  updatedAt: string;
}
