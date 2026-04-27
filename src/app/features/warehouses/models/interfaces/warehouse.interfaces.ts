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
  productId: string;
  productName: string;
  type: string;
  quantity: number;
  notes?: string;
  createdAt: string;
  createdBy: string;
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

export interface StockEntryLine {
  productId: string;
  quantity: number;
  notes?: string;
}

export interface StockEntryRequest {
  lines: StockEntryLine[];
}
