export interface PurchaseLineAllocationCreate {
  warehouseId: string;
  quantity: number;
}

export interface PurchaseLineCreate {
  productId: string;
  quantity: number;
  unitCost: number;
  warehouseAllocations: PurchaseLineAllocationCreate[];
}

export interface PurchaseCreate {
  supplierId: string;
  notes: string | null;
  lines: PurchaseLineCreate[];
}
