import { InvoiceLineCreate } from '@features/invoices/models/interfaces/invoice-create.interface';
import { PaymentType } from '@features/invoices/models/enums/payment-type.enum';

export interface InvoiceUpdate {
  issueDate?: string;
  paymentType: PaymentType;
  notes: string | null;
  lines: InvoiceLineCreate[];
}
