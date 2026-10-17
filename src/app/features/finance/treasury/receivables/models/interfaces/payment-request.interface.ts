export interface PayInvoiceRequest {
  paymentMethodId: string;
  referenceNumber?: string;
  paymentDate: string;
  amount?: number;
  useBalance?: boolean;
  balanceAmount?: number;
}

export interface PayCustomerDebtRequest {
  paymentMethodId: string;
  referenceNumber?: string;
  paymentDate: string;
  useBalance?: boolean;
  balanceAmount?: number;
}

export interface PayPartialDebtRequest {
  paymentMethodId: string;
  referenceNumber?: string;
  paymentDate: string;
  amount: number;
  useBalance?: boolean;
  balanceAmount?: number;
}
