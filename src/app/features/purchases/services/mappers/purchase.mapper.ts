import { PurchaseList } from '@features/purchases/models/interfaces/purchase-list.interface';
import { PurchaseDetails } from '@features/purchases/models/interfaces/purchase-details.interface';

export interface PurchaseFormItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface PurchaseFormModel {
  id?: string;
  supplierId: string;
  notes: string;
  items: PurchaseFormItem[];
}

export class PurchaseMapper {
  static toList(details: PurchaseDetails): PurchaseList {
    return {
      id: details.id,
      purchaseNumber: details.purchaseNumber,
      supplierName: details.supplierName,
      supplierRif: details.supplierRif,
      status: details.status,
      subtotal: details.subtotal,
      createdAt: details.createdAt,
    };
  }

  static toFormModel(details: PurchaseDetails): PurchaseFormModel {
    return {
      id: details.id,
      supplierId: details.supplierId,
      notes: details.notes ?? '',
      items: details.lines.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productCode: item.productCode,
        quantity: item.quantity,
        unitCost: item.unitCost,
        subtotal: item.subtotal,
      })),
    };
  }
}
