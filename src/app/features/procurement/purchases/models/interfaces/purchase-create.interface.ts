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
  paymentType?: 'CASH' | 'CREDIT';
  issueDate?: string;
  dueDate?: string;
  notes: string | null;
  lines: PurchaseLineCreate[];
}
