export interface PendingPayment {
  id: string;
  paymentNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethodName: string;
  status: string;
  paymentDate: string;
  createdAt: string;
  invoiceNumber: string;
  voucherPath: string | null;
}
