export interface WarehouseStockEntry {
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  quantity: number;
  reserved: number;
  available: number;
  allocated: number;
}
