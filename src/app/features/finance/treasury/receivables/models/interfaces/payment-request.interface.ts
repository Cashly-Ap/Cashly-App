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

export interface CreatePaymentRequest {
  customerId: string;
  status: 'PENDING';
  amount: number;
  paymentMethodId: string;
  referenceNumber?: string;
  paymentDate: string;
  notes?: string;
}

export interface CreatedPaymentResponse {
  id: string;
  paymentNumber: string;
  customerId: string;
  amount: number;
  status: string;
  paymentMethodId: string;
  referenceNumber: string | null;
  paymentDate: string;
  notes: string | null;
  createdAt: string;
}
