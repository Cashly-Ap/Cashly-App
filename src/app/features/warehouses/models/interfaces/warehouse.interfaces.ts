export interface WarehouseList {
  id: string;
  name: string;
  state: string;
  municipality: string;
  active: boolean;
}

export interface WarehouseStockItem {
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
}

export interface WarehouseMovementItem {
  id: string;
  warehouseId: string;
  productId: string;
  productCode: string;
  productName: string;
  movementType: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceType?: string;
  referenceId?: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface MovementFilters {
  productId?: string;
  movementType?: string;
  page?: number;
  size?: number;
}

export interface WarehouseDetails {
  id: string;
  name: string;
  state: string;
  municipality: string;
  address?: string;
  description?: string;
  active: boolean;
  stock: WarehouseStockItem[];
  recentMovements: WarehouseMovementItem[];
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseCreate {
  name: string;
  state: string;
  municipality: string;
  address?: string;
  description?: string;
}

export interface WarehouseUpdate {
  name: string;
  state: string;
  municipality: string;
  address?: string;
  description?: string;
}

export interface StockBatchItem {
  productId: string;
  quantity: number;
  unitPrice?: number;
  notes?: string;
}

export interface StockEntryRequest {
  items: StockBatchItem[];
}

export interface StockExitRequest {
  items: StockBatchItem[];
}
