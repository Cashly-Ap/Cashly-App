export interface CreditNoteList {
  id: string;
  noteNumber: string;
  customerName: string | null;
  invoiceNumber: string | null;
  amount: number;
  reason: string;
  createdByName: string;
  createdAt: string;
}

export interface CreditNoteDetail {
  id: string;
  noteNumber: string;
  customerId: string;
  customerName: string | null;
  customerRif: string | null;
  invoiceId: string;
  invoiceNumber: string | null;
  amount: number;
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
