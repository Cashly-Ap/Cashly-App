import { PaymentType } from '@features/finance/billing/invoices/models/enums/payment-type.enum';

export interface InvoiceLineCreate {
  productId: string;
  quantity: number;
  unitPrice: number;
  warehouseAllocations: { warehouseId: string; allocated: number }[];
}

export interface InvoiceCreate {
  customerId: string;
  issueDate?: string;
  orderIds?: string[];
  quoteIds?: string[];
  paymentType: PaymentType;
  notes?: string;
  useBalance?: boolean;
  balanceAmount?: number;
  paymentMethodId?: string;
  lines: InvoiceLineCreate[];
}
