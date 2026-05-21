export interface CreditNoteList {
  id: string;
  noteNumber: string;
  customerId: string;
  customerName: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  appliedAmount: number;
  createdAt: string;
}

export interface CreditNoteDetail {
  id: string;
  noteNumber: string;
  customerId: string;
  customerName: string;
  customerRif: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  appliedAmount: number;
  remainingAmount: number;
  status: string;
  reason: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditNoteCreate {
  customerId: string;
  invoiceId: string;
  amount: number;
  reason: string;
}
