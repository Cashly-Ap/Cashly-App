import { OrderItemFormData } from '@features/orders/models/interfaces';

export interface InvoiceFormData {
  customerId: string;
  issueDate?: string;
  customerAlias: string;
  customerLegalName: string;
  notes: string;
  items: OrderItemFormData[];
  orderIds?: string[];
  quoteIds?: string[];
}
