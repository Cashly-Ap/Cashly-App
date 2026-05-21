export interface PaymentCreate {
  customerId: string;
  type: string;
  amount: number;
  paymentMethodId: string;
  referenceNumber?: string;
  paymentDate: string;
  notes?: string;
}

export interface ApplyPaymentEntry {
  invoiceId: string;
  amount: number;
}

export interface ApplyPayment {
  allocations: ApplyPaymentEntry[];
}
