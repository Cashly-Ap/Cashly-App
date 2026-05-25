export interface CustomerDebtList {
  customerId: string;
  customerName: string;
  customerRif: string;
  totalDebt: number;
  pendingPaymentsAmount: number;
  pendingPaymentsCount: number;
  invoicesWithDebt: number;
  validatedInvoicesCount: number;
  pendingInvoicesCount: number;
  oldestInvoiceDate: string;
}
