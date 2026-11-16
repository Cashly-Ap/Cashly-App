export interface SupplierBalanceTransactionResponse {
  id: string;
  supplierId: string;
  type: string;
  amount: number;
  referenceType: string;
  referenceId: string | null;
  number: string | null;
  referenceNumber: string | null;
  createdBy: string | null;
  createdAt: string | null;
}
