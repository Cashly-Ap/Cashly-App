export interface ProductStockByWarehouse {
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  lastMovementAt: string | null;
}
