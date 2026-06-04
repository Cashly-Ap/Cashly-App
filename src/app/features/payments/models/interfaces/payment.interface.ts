export interface PaymentList {
  id: string;
  paymentNumber: string;
  customerName: string | null;
  invoiceNumber: string | null;
  amount: number;
  status: string;
  createdByName: string;
  createdAt: string;
}

export interface PaymentDetail {
  id: string;
  paymentNumber: string;
  customerId: string;
  customerName: string | null;
  customerRif: string | null;
  invoiceId: string;
  invoiceNumber: string | null;
  amount: number;
  reference: string | null;
  status: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentCreate {
  customerId: string;
  invoiceId: string;
  amount: number;
  reference?: string;
}

export interface PaymentUpdate {
  id: string;
  amount?: number;
  reference?: string;
}
