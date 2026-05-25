export interface PayInvoiceRequest {
  paymentMethodId: string;
  referenceNumber?: string;
  paymentDate: string;
  amount?: number;
}

export interface PayCustomerDebtRequest {
  paymentMethodId: string;
  referenceNumber?: string;
  paymentDate: string;
}

export interface PayPartialDebtRequest {
  paymentMethodId: string;
  referenceNumber?: string;
  paymentDate: string;
  amount: number;
}
