import { InvoiceLineCreate } from './invoice-create.interface';
import { PaymentType } from '@features/invoices/models/enums/payment-type.enum';

export interface InvoiceUpdate {
  paymentType: PaymentType;
  notes: string | null;
  lines: InvoiceLineCreate[];
}
