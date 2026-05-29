export interface PendingPaymentSummary {
  id: string;
  amount: number;
  status: string;
  registeredAt: string;
}

export interface CustomerInvoiceDebt {
  invoiceId: string;
  invoiceNumber: string;
  status: string;
  displayStatus: string;
  invoiceDate: string;
  subtotal: number;
  returnedTotal: number;
  totalPaid: number;
  balance: number;
  realBalance: number;
  pendingPayment: PendingPaymentSummary | null;
  merchantId: string | null;
  merchantName: string | null;
  lineCount: number;
  hasDeliveryFile: boolean | null;
}
