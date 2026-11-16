export interface GlobalDebtSummary {
  totalDebt: number;
  totalCustomersWithDebt: number;
  totalInvoicesWithDebt: number;
  totalPendingValidationAmount: number;
  debtByStatus: Record<string, number>;
  calculatedAt: string;
}
