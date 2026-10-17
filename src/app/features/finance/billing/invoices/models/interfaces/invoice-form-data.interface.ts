import { OrderItemFormData } from '@features/orders/models/interfaces/order-form-data.interface';

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
