export interface QuoteLineAllocationCreate {
  warehouseId: string;
  allocatedQuantity: number;
}

export interface QuoteLineCreate {
  productId: string;
  quantity: number;
  unitPrice: number;
  warehouseAllocations: QuoteLineAllocationCreate[];
}

export interface QuoteCreate {
  customerId: string;
  notes: string | null;
  lines: QuoteLineCreate[];
}
