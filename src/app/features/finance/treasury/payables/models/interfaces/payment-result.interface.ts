export interface PaymentResult {
  id: string;
  paymentNumber: string;
  supplierId: string;
  amount: number;
  appliedAmount: number;
  paymentMethodId: string | null;
  source: string;
  referenceNumber: string | null;
  paymentDate: string;
  notes: string | null;
  status: string;
  createdAt: string;
}
