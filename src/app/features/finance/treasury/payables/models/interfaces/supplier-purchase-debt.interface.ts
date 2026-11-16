export interface SupplierPurchaseDebt {
  purchaseId: string;
  purchaseNumber: string;
  status: string;
  paymentType: 'CASH' | 'CREDIT';
  issueDate: string;
  dueDate: string;
  subtotal: number;
  returnedTotal: number;
  totalPaid: number;
  total: number;
  balance: number;
  pendingPaymentId: string | null;
  pendingPaymentStatus: string | null;
}
