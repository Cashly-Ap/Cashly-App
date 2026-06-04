export interface BalanceTransactionResponse {
  id: string;
  customerId: string;
  type: string;
  amount: number;
  referenceType: string;
  referenceId: string | null;
  notes: string | null;
  createdBy: string;
  createdAt: string;
}
