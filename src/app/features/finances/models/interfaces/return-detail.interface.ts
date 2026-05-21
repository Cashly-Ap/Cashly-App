export interface ReturnDetail {
  id: string;
  returnNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerRif: string;
  returnType: string;
  reason: string;
  status: string;
  totalAmount: number;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  lines: ReturnLine[];
}

export interface ReturnLine {
  id: string;
  invoiceLineId: string;
  productId: string;
  productName: string;
  quantity: number;
  warehouseId: string;
  warehouseName: string;
  unitPrice: number;
  lineTotal: number;
}
