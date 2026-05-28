import { PaymentType } from '../enums';

export interface PaymentList {
  id: string;
  paymentNumber: string;
  customerName: string | null;
  invoiceNumber: string | null;
  amount: number;
  paymentType: PaymentType;
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
  paymentType: PaymentType;
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
  paymentType: PaymentType;
}

export interface PaymentUpdate {
  id: string;
  customerId?: string;
  invoiceId?: string;
  amount?: number;
  reference?: string;
  paymentType?: PaymentType;
}
