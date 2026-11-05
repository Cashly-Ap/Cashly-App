import { Observable } from 'rxjs';

export type ProductPickerMode = 'sale' | 'purchase';

export interface ProductPickerStockItem {
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  quantity: number;
  reserved: number;
  available: number;
}

export interface ProductPickerItem {
  id: string;
  code: string;
  name: string;
  categoryName: string;
  active: boolean;
  composite?: boolean;
  price: number;
  totalStock: number;
  stockItems: ProductPickerStockItem[];
}

export interface ProductPickerFilters {
  search?: string;
  categoryId?: string;
  composite?: boolean;
  withStock?: boolean;
  page: number;
  size: number;
}

export interface ProductPickerPage {
  content: ProductPickerItem[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface ProductPickerAllocation {
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  available: number;
  allocated: number;
}

export interface ProductPickerSelection {
  product: ProductPickerItem;
  quantity: number;
  unitPrice: number;
  allocations: ProductPickerAllocation[];
}

export type ProductPickerLoader = (filters: ProductPickerFilters) => Observable<ProductPickerPage>;
