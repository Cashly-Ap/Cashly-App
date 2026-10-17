export interface QuoteLineAllocationEdit {
  warehouseId: string;
  allocatedQuantity: number;
}

export interface QuoteLineEdit {
  id?: string;
  productId: string;
  productName?: string;
  productCode?: string;
  quantity: number;
  unitPrice: number;
  warehouseAllocations: QuoteLineAllocationEdit[];
}

export interface QuoteEdit {
  notes: string | null;
  lines: QuoteLineEdit[];
}
