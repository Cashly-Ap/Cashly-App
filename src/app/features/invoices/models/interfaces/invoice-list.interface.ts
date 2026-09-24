import { InvoiceStatus } from '@features/invoices/models/enums/invoice-status.enum';
import { PaymentType } from '@features/invoices/models/enums/payment-type.enum';

export interface InvoiceList {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  status: InvoiceStatus;
  statusLabel: string;
  paymentType: PaymentType;
  subtotal: number;
  total: number;
  paidAmount: number;
  creditApplied: number;
  debitApplied: number;
  lineCount: number;
  orderId: string | null;
  orderNumber: string | null;
  createdAt: string;
  issueDate?: string;
  dueDate?: string;
  returnStatus: 'PARTIAL' | 'FULL' | null;
  overdue?: boolean;
}
