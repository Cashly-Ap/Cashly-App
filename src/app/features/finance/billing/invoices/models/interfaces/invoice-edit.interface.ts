import { InvoiceLineCreate } from '@features/finance/billing/invoices/models/interfaces/invoice-create.interface';
import { PaymentType } from '@features/finance/billing/invoices/models/enums/payment-type.enum';

export interface InvoiceUpdate {
  issueDate?: string;
  paymentType: PaymentType;
  notes: string | null;
  lines: InvoiceLineCreate[];
}
