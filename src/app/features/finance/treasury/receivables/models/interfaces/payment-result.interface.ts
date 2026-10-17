export interface PaymentResult {
  id: string;
  status: string;
  message: string;
  requiresValidation: boolean;
}

export interface BulkPaymentResult {
  id: string;
  status: string;
  message: string;
  requiresValidation: boolean;
  processedInvoices: number;
  totalAmount: number;
}
