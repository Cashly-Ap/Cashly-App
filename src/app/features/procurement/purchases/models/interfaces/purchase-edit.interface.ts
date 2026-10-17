export interface PurchaseLineAllocationEdit {
  warehouseId: string;
  quantity: number;
}

export interface PurchaseLineEdit {
  id?: string;
  productId: string;
  productName?: string;
  productCode?: string;
  quantity: number;
  unitCost: number;
  warehouseAllocations: PurchaseLineAllocationEdit[];
}

export interface PurchaseEdit {
  notes: string | null;
  lines: PurchaseLineEdit[];
}
