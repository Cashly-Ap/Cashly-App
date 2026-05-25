export interface CustomerDebtSummary {
  customerId: string;
  customerName: string;
  customerRif: string;
  customerPhone: string | null;
  customerEmail: string | null;
  totalDebt: number;
  pendingPaymentsAmount: number;
  availableDebt: number;
  invoicesWithDebt: number;
  pendingPaymentsCount: number;
  pendingInvoicesCount: number;
  pendingInvoicesAmount: number;
  validatedInvoicesCount: number;
  debtBreakdown: Record<string, number>;
}
