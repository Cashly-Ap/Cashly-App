export interface SupplierPayment {
  id: string;
  paymentNumber: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  appliedAmount: number;
  paymentMethodName: string;
  status: string;
  source: string;
  paymentDate: string;
  createdAt: string;
  purchaseNumber: string | null;
  referenceNumber: string;
  notes: string;
  createdByName?: string;
}
