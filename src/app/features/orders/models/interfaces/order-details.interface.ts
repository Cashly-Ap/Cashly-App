import { OrderStatus } from '@features/orders/models/enums/order-status.enum';

export interface OrderItemAllocationDetail {
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  available: number;
  allocated: number;
}

export interface OrderItemDetail {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  warehouseAllocations: OrderItemAllocationDetail[];
  warehouseStocks?: {
    warehouseId: string;
    warehouseCode: string;
    warehouseName: string;
    quantity: number;
    reserved: number;
    available: number;
  }[];
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
  creditLimit?: number;
  availableCredit?: number;
  items: OrderItemDetail[];
  createdAt: string;
  updatedAt: string;
}
