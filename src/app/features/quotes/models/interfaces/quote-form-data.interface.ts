import { OrderProductStockItem } from '@features/orders/models/interfaces/order-product.interface';
import { WarehouseAllocation } from '@features/orders/models/interfaces/order-item-allocation.interface';

export interface QuoteFormData {
  customerId: string;
  customerName: string;
  customerRif: string;
  notes: string;
  items: QuoteLineFormData[];
}

export interface QuoteLineFormData {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  stock: OrderProductStockItem[];
  warehouseAllocations: WarehouseAllocation[];
}
