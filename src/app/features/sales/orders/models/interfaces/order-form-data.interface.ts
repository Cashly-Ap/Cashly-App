import { OrderProductStockItem } from '@features/sales/orders/models/interfaces/order-product.interface';
import { WarehouseAllocation } from '@features/sales/orders/models/interfaces/order-item-allocation.interface';

export interface OrderFormData {
  customerId: string;
  customerAlias: string;
  customerLegalName: string;
  notes: string;
  items: OrderItemFormData[];
}

export interface OrderItemFormData {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  stock: OrderProductStockItem[];
  warehouseAllocations: WarehouseAllocation[];
}
