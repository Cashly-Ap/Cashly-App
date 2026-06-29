import { PurchaseStatus } from '@features/purchases/models/enums/purchase-status.enum';

export interface PurchaseList {
  id: string;
  purchaseNumber: string;
  supplierName: string;
  supplierRif: string;
  status: PurchaseStatus;
  subtotal: number;
  createdAt: string;
}
