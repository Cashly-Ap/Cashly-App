import { PurchaseStatus } from '@features/purchases/models/enums/purchase-status.enum';

export interface PurchaseAllocationDetail {
  warehouseId: string;
  warehouseName: string;
  warehouseCode?: string;
  allocatedQuantity: number;
}

export interface PurchaseStockItemDetail {
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  quantity: number;
  reserved: number;
  available: number;
}

export interface PurchaseLineDetail {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
  allocations: PurchaseAllocationDetail[];
  stockItems: PurchaseStockItemDetail[];
}

export interface PurchaseDetails {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  supplierRif: string;
  createdBy: string;
  createdByName: string;
  status: PurchaseStatus;
  notes: string | null;
  subtotal: number;
  lines: PurchaseLineDetail[];
  createdAt: string;
  updatedAt: string;
}
