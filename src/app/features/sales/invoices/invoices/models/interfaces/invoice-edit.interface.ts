import { InvoiceLineCreate } from '@features/sales/invoices/invoices/models/interfaces/invoice-create.interface';
import { PaymentType } from '@features/sales/invoices/invoices/models/enums/payment-type.enum';

export interface InvoiceUpdate {
  issueDate?: string;
  paymentType: PaymentType;
  notes: string | null;
  lines: InvoiceLineCreate[];
}
