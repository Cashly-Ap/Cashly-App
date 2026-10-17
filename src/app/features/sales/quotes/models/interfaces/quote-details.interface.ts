import { QuoteStatus } from '@features/sales/quotes/models/enums/quote-status.enum';

export interface QuoteAllocationDetail {
  warehouseId: string;
  warehouseName: string;
  warehouseCode?: string;
  allocatedQuantity: number;
}

export interface QuoteWarehouseStock {
  warehouseId: string;
  warehouseName: string;
  available: number;
}

export interface QuoteLineDetail {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  allocations: QuoteAllocationDetail[];
  warehouseStocks?: QuoteWarehouseStock[];
}

export interface QuoteDetails {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  customerRif: string;
  createdBy: string;
  createdByName: string;
  status: QuoteStatus;
  notes: string | null;
  subtotal: number;
  lines: QuoteLineDetail[];
  createdAt: string;
  updatedAt: string;
}
