export interface PendingPayment {
  id: string;
  paymentNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethodName: string;
  status: string;
  source: string;
  paymentDate: string;
  createdAt: string;
  invoiceNumber: string;
  voucherUrl: string | null;
  referenceNumber?: string;
  notes?: string;
  createdByName?: string;
}
