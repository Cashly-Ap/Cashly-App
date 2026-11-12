export interface PayPurchaseRequest {
  paymentMethodId: string;
  amount: number;
  referenceNumber?: string;
  paymentDate: string;
  notes?: string;
}

export interface PaySupplierDebtRequest {
  paymentMethodId: string;
  amount: number;
  referenceNumber?: string;
  paymentDate: string;
  notes?: string;
}

export interface PayPartialDebtRequest {
  paymentMethodId: string;
  amount: number;
  referenceNumber?: string;
  paymentDate: string;
  notes?: string;
}

export interface CreateSupplierPaymentRequest {
  supplierId: string;
  status: 'PENDING';
  amount: number;
  paymentMethodId: string;
  referenceNumber?: string;
  paymentDate: string;
  notes?: string;
}

export interface CreatedSupplierPaymentResponse {
  id: string;
  paymentNumber: string;
  supplierId: string;
  amount: number;
  appliedAmount: number;
  paymentMethodId: string;
  source: string;
  referenceNumber: string | null;
  paymentDate: string;
  notes: string | null;
  status: string;
  createdAt: string;
}
