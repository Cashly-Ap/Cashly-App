import { PurchaseStatus } from '@features/purchases/models/enums/purchase-status.enum';

export interface PurchaseAllocationDetail {
  warehouseId: string;
  warehouseName: string;
  warehouseCode?: string;
  allocatedQuantity: number;
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
