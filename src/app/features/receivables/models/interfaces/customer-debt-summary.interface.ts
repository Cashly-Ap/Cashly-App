export interface CustomerDebtSummary {
  customerId: string;
  customerName: string;
  customerRif: string;
  customerPhone: string | null;
  customerEmail: string | null;
  totalDebt: number;
  pendingPaymentsAmount: number;
  availableDebt: number;
  creditLimit: number;
  availableCredit: number;
  invoicesWithDebt: number;
  pendingPaymentsCount: number;
  pendingInvoicesCount: number;
  pendingInvoicesAmount: number;
  validatedInvoicesCount: number;
  debtBreakdown: Record<string, number>;
}
