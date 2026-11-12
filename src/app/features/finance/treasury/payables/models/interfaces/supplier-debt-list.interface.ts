export interface SupplierDebtList {
  supplierId: string;
  supplierName: string;
  supplierRif: string;
  totalDebt: number;
  pendingPaymentsAmount: number;
  pendingPurchasesCount: number;
  oldestDueDate: string | null;
  creditDays: number;
  creditLimit: number;
  availableCredit: number;
  supplierBalance: number;
}
