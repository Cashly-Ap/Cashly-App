import { OrderProductStockItem } from '@features/orders/models/interfaces/order-product.interface';
import { WarehouseAllocation } from '@features/orders/models/interfaces/order-item-allocation.interface';

export interface PurchaseFormData {
  supplierId: string;
  supplierName: string;
  supplierRif: string;
  notes: string;
  items: PurchaseLineFormData[];
}

export interface PurchaseLineFormData {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitCost: number;
  stock: OrderProductStockItem[];
  warehouseAllocations: WarehouseAllocation[];
}
