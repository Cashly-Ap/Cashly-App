export interface ReturnCreate {
  invoiceId: string;
  customerId: string;
  returnType: string;
  reason: string;
  lines: ReturnLineCreate[];
}

export interface ReturnLineCreate {
  invoiceLineId: string;
  productId: string;
  quantity: number;
  warehouseId: string;
  unitPrice: number;
}
