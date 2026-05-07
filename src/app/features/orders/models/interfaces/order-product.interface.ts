export interface OrderProductStockItem {
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  quantity: number;
}

export interface OrderProduct {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  categoryName: string;
  composite: boolean;
  active: boolean;
  photo: string | null;
  customerPrice: number;
  totalStock: number;
  stock: OrderProductStockItem[];
}
