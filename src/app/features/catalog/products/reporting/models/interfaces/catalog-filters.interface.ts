export interface CatalogFilters {
  search?: string;
  categoryId?: string;
  warehouseId?: string;
  composite?: boolean;
  withStock?: boolean;
  lowStock?: boolean;
  page?: number;
  size?: number;
}
