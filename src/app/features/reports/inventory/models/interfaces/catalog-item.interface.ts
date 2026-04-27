export interface CatalogWarehouseStock {
  warehouseId: string;
  warehouseName: string;
  quantity: number;
}

export interface CatalogItem {
  productId: string;
  productName: string;
  categoryName: string;
  composite: boolean;
  totalStock: number;
  warehouseStocks: CatalogWarehouseStock[];
}
