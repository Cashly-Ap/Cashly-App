export interface CustomerWarehouseAccessItem {
  warehouseId: string;
  warehouseName: string;
  state: string;
  municipality: string;
}

export interface CustomerWarehouseAccessResponse {
  items: CustomerWarehouseAccessItem[];
}
