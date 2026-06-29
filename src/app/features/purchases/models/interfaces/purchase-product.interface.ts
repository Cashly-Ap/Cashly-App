export interface PurchaseProduct {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  categoryName: string;
  active: boolean;
  stock: number;
  stockItems: PurchaseProductStockItem[];
}

export interface PurchaseProductStockItem {
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  quantity: number;
  reserved: number;
  available: number;
}
