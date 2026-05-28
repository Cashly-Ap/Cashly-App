export interface ReturnList {
  id: string;
  returnNumber: string;
  customerName: string;
  invoiceNumber: string;
  returnType: string;
  totalAmount: number;
  reason: string;
  createdByName: string;
  createdAt: string;
}

export interface ReturnLineAllocation {
  warehouseId: string;
  allocated: number;
  warehouseName?: string;
}

export interface ReturnLine {
  id: string;
  invoiceLineId: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  allocations: ReturnLineAllocation[];
}

export interface ReturnDetail {
  id: string;
  returnNumber: string;
  customerId: string;
  customerName: string;
  customerRif: string;
  invoiceId: string;
  invoiceNumber: string;
  returnType: string;
  totalAmount: number;
  reason: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  lines: ReturnLine[];
}

export interface ReturnCreateLine {
  invoiceLineId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  allocations: { warehouseId: string; allocated: number }[];
}

export interface ReturnCreate {
  customerId: string;
  invoiceId: string;
  returnType: string;
  reason: string;
  lines: ReturnCreateLine[];
}
