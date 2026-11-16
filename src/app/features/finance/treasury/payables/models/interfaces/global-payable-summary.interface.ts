export interface GlobalPayableSummary {
  totalDebt: number;
  totalSuppliersWithDebt: number;
  totalPurchasesWithDebt: number;
  totalPendingValidationAmount: number;
  totalSupplierBalance: number;
  calculatedAt: string;
}
