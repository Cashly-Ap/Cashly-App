export interface PaymentList {
  id: string;
  paymentNumber: string;
  customerId: string;
  customerName: string;
  type: string;
  amount: number;
  paymentMethodName: string;
  status: string;
  appliedAmount: number;
  paymentDate: string;
  createdAt: string;
}
