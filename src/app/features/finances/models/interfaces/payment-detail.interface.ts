export interface PaymentDetail {
  id: string;
  paymentNumber: string;
  customerId: string;
  customerName: string;
  customerRif: string;
  type: string;
  amount: number;
  paymentMethodId: string;
  paymentMethodName: string;
  status: string;
  appliedAmount: number;
  remainingAmount: number;
  referenceNumber: string | null;
  paymentDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  allocations: PaymentAllocation[];
}

export interface PaymentAllocation {
  id: string;
  invoiceId: string;
  invoiceNumber?: string;
  allocatedAmount: number;
  createdAt: string;
}
