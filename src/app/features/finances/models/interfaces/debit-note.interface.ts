export interface DebitNoteList {
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

export interface DebitNoteDetail {
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

export interface DebitNoteCreate {
  customerId: string;
  invoiceId: string;
  amount: number;
  reason: string;
}
