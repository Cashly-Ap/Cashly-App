import { OrderItemFormData } from '@features/orders/models/interfaces';

export interface InvoiceFormData {
  customerId: string;
  customerAlias: string;
  customerLegalName: string;
  notes: string;
  items: OrderItemFormData[];
}
