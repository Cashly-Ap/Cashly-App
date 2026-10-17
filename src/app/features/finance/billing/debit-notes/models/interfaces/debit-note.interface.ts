export interface DebitNoteList {
  id: string;
  noteNumber: string;
  customerId: string;
  customerName: string;
  invoiceNumber: string;
  amount: number;
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
